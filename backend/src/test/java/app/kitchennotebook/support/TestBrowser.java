package app.kitchennotebook.support;

import java.io.IOException;
import java.net.CookieHandler;
import java.net.HttpCookie;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

/**
 * A minimal browser for integration tests: keeps cookies, follows redirects step by step and records every
 * {@code Set-Cookie} header the backend sends.
 */
public final class TestBrowser {

    private static final Pattern LOGIN_FORM_ACTION =
            Pattern.compile("<form[^>]*id=\"kc-form-login\"[^>]*action=\"([^\"]+)\"|<form[^>]*action=\"([^\"]+)\"[^>]*id=\"kc-form-login\"");

    private final String backendBaseUrl;
    private final LocalhostCookieJar cookies = new LocalhostCookieJar();
    private final HttpClient client;
    private final List<String> backendSetCookieHeaders = new ArrayList<>();
    private final List<String> backendResponseBodies = new ArrayList<>();

    public TestBrowser(String backendBaseUrl) {
        this.backendBaseUrl = backendBaseUrl;
        this.client = HttpClient.newBuilder()
                .cookieHandler(cookies)
                .followRedirects(HttpClient.Redirect.NEVER)
                .build();
    }

    public HttpResponse<String> get(String url) {
        return send(HttpRequest.newBuilder(resolve(url)).GET().build());
    }

    public HttpResponse<String> postForm(String url, Map<String, String> form, Map<String, String> headers) {
        String body = form.entrySet().stream()
                .map(e -> encode(e.getKey()) + "=" + encode(e.getValue()))
                .collect(Collectors.joining("&"));
        HttpRequest.Builder request = HttpRequest.newBuilder(resolve(url))
                .header("Content-Type", "application/x-www-form-urlencoded")
                .POST(HttpRequest.BodyPublishers.ofString(body));
        headers.forEach(request::header);
        return send(request.build());
    }

    /** Signs in through the real Authorization Code flow, the way a browser does after "Sign in". */
    public HttpResponse<String> signIn(String email, String password) {
        HttpResponse<String> loginPage = followRedirects(get("/oauth2/authorization/keycloak"));
        String action = loginFormAction(loginPage.body())
                .orElseThrow(() -> new IllegalStateException("No Keycloak login form: " + loginPage.body()));
        HttpResponse<String> afterLogin = postForm(action, Map.of("username", email, "password", password), Map.of());
        HttpResponse<String> result = followRedirectsWithinBackendOrKeycloak(afterLogin);
        if (!isRedirect(result)) {
            throw new IllegalStateException("Sign-in did not return to the app: %d %s%n%s".formatted(
                    result.statusCode(), result.uri(), result.body().substring(0, Math.min(2000, result.body().length()))));
        }
        return result;
    }

    public HttpResponse<String> followRedirects(HttpResponse<String> response) {
        HttpResponse<String> current = response;
        for (int i = 0; i < 10 && isRedirect(current); i++) {
            current = get(location(current));
        }
        return current;
    }

    private HttpResponse<String> followRedirectsWithinBackendOrKeycloak(HttpResponse<String> response) {
        HttpResponse<String> current = response;
        // Stop at the backend's final redirect to "/", which the SPA (not the backend) serves.
        while (isRedirect(current) && !location(current).equals(backendBaseUrl + "/")
                && !location(current).equals("/")) {
            current = get(location(current));
        }
        return current;
    }

    public static Optional<String> loginFormAction(String html) {
        Matcher matcher = LOGIN_FORM_ACTION.matcher(html);
        if (!matcher.find()) {
            return Optional.empty();
        }
        String action = matcher.group(1) != null ? matcher.group(1) : matcher.group(2);
        return Optional.of(action.replace("&amp;", "&"));
    }

    public static boolean isRedirect(HttpResponse<?> response) {
        return response.statusCode() >= 300 && response.statusCode() < 400;
    }

    public static String location(HttpResponse<?> response) {
        return response.headers().firstValue("Location").orElseThrow();
    }

    public Optional<String> cookie(String name) {
        return cookies.value(name);
    }

    /** Replaces the value of a backend cookie, e.g. to replay an old session cookie. */
    public void setBackendCookie(String name, String value) {
        cookies.set(name, value, "/");
    }

    public List<String> backendSetCookieHeaders() {
        return List.copyOf(backendSetCookieHeaders);
    }

    public List<String> backendResponseBodies() {
        return List.copyOf(backendResponseBodies);
    }

    private HttpResponse<String> send(HttpRequest request) {
        try {
            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
            if (request.uri().toString().startsWith(backendBaseUrl)) {
                backendSetCookieHeaders.addAll(response.headers().allValues("Set-Cookie"));
                backendResponseBodies.add(response.body());
            }
            return response;
        } catch (IOException e) {
            throw new IllegalStateException(e);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new IllegalStateException(e);
        }
    }

    private URI resolve(String url) {
        return URI.create(url.startsWith("/") ? backendBaseUrl + url : url);
    }

    private static String encode(String value) {
        return URLEncoder.encode(value, StandardCharsets.UTF_8);
    }

    /**
     * Cookie jar for one host (localhost) that, like browsers, also sends {@code Secure} cookies over plain http to
     * localhost. {@link java.net.CookieManager} does not, which breaks Keycloak's login.
     */
    private static final class LocalhostCookieJar extends CookieHandler {

        private final Map<String, HttpCookie> cookies = new LinkedHashMap<>();

        @Override
        public synchronized Map<String, List<String>> get(URI uri, Map<String, List<String>> requestHeaders) {
            String path = uri.getPath() == null || uri.getPath().isEmpty() ? "/" : uri.getPath();
            List<String> matching = cookies.values().stream()
                    .filter(cookie -> path.startsWith(cookie.getPath()) || (path + "/").equals(cookie.getPath()))
                    .map(cookie -> cookie.getName() + "=" + cookie.getValue())
                    .toList();
            return matching.isEmpty() ? Map.of() : Map.of("Cookie", List.of(String.join("; ", matching)));
        }

        @Override
        public synchronized void put(URI uri, Map<String, List<String>> responseHeaders) {
            responseHeaders.getOrDefault("Set-Cookie", List.of()).forEach(header -> {
                for (HttpCookie cookie : HttpCookie.parse(header)) {
                    String path = cookie.getPath() == null ? "/" : cookie.getPath();
                    String key = cookie.getName() + "|" + path;
                    if (cookie.getMaxAge() == 0) {
                        cookies.remove(key);
                    } else {
                        cookie.setPath(path);
                        cookies.put(key, cookie);
                    }
                }
            });
        }

        synchronized Optional<String> value(String name) {
            return cookies.values().stream().filter(c -> c.getName().equals(name)).map(HttpCookie::getValue)
                    .findFirst();
        }

        synchronized void set(String name, String value, String path) {
            HttpCookie cookie = new HttpCookie(name, value);
            cookie.setPath(path);
            cookies.put(name + "|" + path, cookie);
        }
    }
}
