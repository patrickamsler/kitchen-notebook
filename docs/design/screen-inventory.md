# Screen inventory

> Screenshots of the Claude Design canvas, exported for the shipped look (Fluent 2-inspired, Blueberry, compact).
> Every screen has four files in `screens/`: `<id>-<name>--desktop-light.png`, `--desktop-dark.png`,
> `--mobile-light.png`, `--mobile-dark.png`. Desktop frames are 1280 px wide at 1×; mobile frames are 390 px wide at 2×.
> Tokens and component states: `screens/00-tokens-and-component-states.png`.

Reference a screen by its ID in specs and change proposals (e.g. "Screen 20"). When a change alters a screen, it carries
updated screenshots in `openspec/changes/<name>/ui/`; on archive they replace the files here.

| ID | Screen | Files | Requirements | Notes |
|---|---|---|---|---|
| 01 | Sign in | `01-sign-in--*.png` | ACC-05, ACC-08 |  |
| 02 | Sign up with email | `02-sign-up-with-email--*.png` | ACC-01, ACC-02 |  |
| 03 | Check your email | `03-check-your-email--*.png` | ACC-03, ACC-04 |  |
| 04a | Forgot password | `04a-forgot-password--*.png` | ACC-06 |  |
| 04b | Reset password | `04b-reset-password--*.png` | ACC-06 |  |
| 05a | Accept invitation · signed out | `05a-accept-invitation-signed-out--*.png` | INV-04, INV-05 |  |
| 05b | Accept invitation · signed in | `05b-accept-invitation-signed-in--*.png` | INV-04, INV-06 |  |
| 05c | Accept invitation · new account | `05c-accept-invitation-new-account--*.png` | INV-07 |  |
| 05d | Accept invitation · wrong account | `05d-accept-invitation-wrong-account--*.png` | INV-08 |  |
| 06a | Onboarding · name your notebook | `06a-onboarding-name-your-notebook--*.png` | ACC-10 |  |
| 06b | Onboarding · invite people | `06b-onboarding-invite-people--*.png` | ACC-11 |  |
| 06c | Onboarding · empty notebook | `06c-onboarding-empty-notebook--*.png` | ACC-12, REC-06 |  |
| 07a | Recipe list · grid + sort menu | `07a-recipe-list-grid-sort-menu--*.png` | REC-01, REC-02, REC-05, REC-08 |  |
| 07b | Recipe list · list view + account menu | `07b-recipe-list-list-view-account-menu--*.png` | REC-01, ACC-07 |  |
| 08 | Search active · ingredient search | `08-search-active-ingredient-search--*.png` | REC-03, REC-04 |  |
| 09a | Empty state · empty notebook | `09a-empty-state-empty-notebook--*.png` | REC-06 |  |
| 09b | Empty state · no search results | `09b-empty-state-no-search-results--*.png` | REC-06 |  |
| 09c | Empty state · can view, no recipes yet | `09c-empty-state-can-view-no-recipes-yet--*.png` | REC-06, NB-04 | Can view member |
| 10 | Loading skeletons | `10-loading-skeletons--*.png` | REC-07 |  |
| 11a | Recipe detail · interactive (servings, ticks, steps) | `11a-recipe-detail-interactive-servings-ticks-steps--*.png` | REC-10 – REC-15 | Interactive on the canvas (servings, ticks, steps) |
| 11b | Recipe detail · cooking mode | `11b-recipe-detail-cooking-mode--*.png` | REC-17 |  |
| 12 | Recipe detail · read only (Can view) | `12-recipe-detail-read-only-can-view--*.png` | REC-16, NB-04 |  |
| 13a | Create / edit recipe · validation errors | `13a-create-edit-recipe-validation-errors--*.png` | REC-21, REC-24 |  |
| 13b | Create / edit recipe · unsaved-changes dialog | `13b-create-edit-recipe-unsaved-changes-dialog--*.png` | REC-25 |  |
| 13c | Create recipe · blank form, illustrations, import link | `13c-create-recipe-blank-form-illustrations-import-link--*.png` | REC-20 – REC-23 |  |
| 14a | Import recipe · paste link or text | `14a-import-recipe-paste-link-or-text--*.png` | IMP-01, IMP-02 | Deferred (import not in v1) |
| 14b | Import recipe · parsing progress | `14b-import-recipe-parsing-progress--*.png` | IMP-03 | Deferred (import not in v1) |
| 14c | Import recipe · prefilled form for review | `14c-import-recipe-prefilled-form-for-review--*.png` | IMP-04, IMP-05 | Deferred (import not in v1) |
| 15a | Delete confirmation dialog | `15a-delete-confirmation-dialog--*.png` | REC-30, REC-32 |  |
| 15b | Delete · undo snackbar | `15b-delete-undo-snackbar--*.png` | REC-31 |  |
| 17a | Notebook members · access, pending invites | `17a-notebook-members-access-pending-invites--*.png` | NB-06, NB-07, INV-03 |  |
| 17b | Invite people · access | `17b-invite-people-access--*.png` | INV-01, INV-02 |  |
| 17c | Transfer ownership · from Settings | `17c-transfer-ownership-from-settings--*.png` | SET-13 |  |
| 18a | Notebook switcher · only with 2+ notebooks | `18a-notebook-switcher-only-with-2-notebooks--*.png` | NB-03 |  |
| 18b | Create notebook · from Settings | `18b-create-notebook-from-settings--*.png` | SET-15 |  |
| 20 | Shopping list | `20-shopping-list--*.png` | SHOP-01 – SHOP-09, SHOP-11 | Shows an item in edit mode |
| 20b | Shopping list · empty list confirmation | `20b-shopping-list-empty-list-confirmation--*.png` | SHOP-10 |  |
| 21 | Shopping list · empty | `21-shopping-list-empty--*.png` | SHOP-01, SHOP-05 |  |
| 22a | Profile & settings · notebooks, recipe types | `22a-profile-and-settings-notebooks-recipe-types--*.png` | SET-01, SET-10 – SET-14, SET-20, SET-30, SET-31, SET-40, SET-50 |  |
| 22b | Delete account · dangerous-action confirmation | `22b-delete-account-dangerous-action-confirmation--*.png` | SET-51 |  |

Screens 16 and 19 do not exist (numbers were dropped while the design was simplified).
The clickable prototypes (desktop and mobile) live only on the canvas.
