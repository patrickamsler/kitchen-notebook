-- Kitchen Notebook seed data
-- Run this in the Supabase SQL Editor after schema.sql

set search_path = app;

-- Late-Summer Panzanella
with
  r as (
    insert into recipes (title, description, notes, created_at) values (
      'Late-Summer Panzanella',
      'A loose, generous bread salad — every fridge raid welcome. Mostly an excuse for stale sourdough and a bottle of good vinegar.',
      'The bread should drink up the dressing — that''s the whole point. If you have an extra 20 minutes, salt the cucumber slices in a colander first to draw out water; it makes a real difference. Day-two leftovers are mush, but excellent mush.',
      '2026-04-29T13:30:00.000Z'
    ) returning id
  ),
  rt as (
    insert into recipe_types (recipe_id, type_id)
    select id, t from r, unnest(array['italian'::text, 'starter'::text]) as t
  ),
  ing as (
    insert into ingredients (recipe_id, amount, name)
    select r.id, v.amt, v.nm from r, (values
      ('400g',        'day-old sourdough, torn'),
      ('5',           'ripe heirloom tomatoes'),
      ('200g',        'cherry tomatoes, halved'),
      ('1',           'cucumber, peeled in strips'),
      ('1 small',     'red onion, sliced thin'),
      ('1',           'yellow pepper, charred'),
      ('100g',        'Castelvetrano olives, torn'),
      ('8',           'anchovy fillets'),
      ('2 tbsp',      'capers in brine'),
      ('1 bunch',     'basil, leaves only'),
      ('1 small bunch','flat-leaf parsley'),
      ('1 ball',      'burrata (optional but right)'),
      ('6 tbsp',      'extra virgin olive oil'),
      ('3 tbsp',      'red wine vinegar'),
      ('1 clove',     'garlic, grated'),
      ('1 tsp',       'Dijon mustard'),
      ('to taste',    'flaky salt + black pepper')
    ) as v(amt, nm)
  )
insert into steps (recipe_id, "order", description)
select r.id, v.ord, v.dsc from r, (values
  (1, 'Toast the torn bread with 2 tbsp of the olive oil and a good pinch of salt at 200°C / 400°F for 8–10 minutes until golden but still chewy in the middle. Cool on the tray.'),
  (2, 'Whisk the remaining olive oil, vinegar, garlic, and mustard in the bottom of a big bowl. Add the tomatoes and a generous pinch of salt; let them sit for 10 minutes to draw out their juice.'),
  (3, 'Pile in everything else — bread, cucumber, onion, pepper, olives, anchovies, capers, herbs. Toss with your hands until soaked. Tear the burrata over the top, finish with flaky salt and pepper, and serve immediately.')
) as v(ord, dsc);


-- Slow-Roasted Tomato Bread
with
  r as (
    insert into recipes (title, description, notes, created_at) values (
      'Slow-Roasted Tomato Bread',
      'Sweet, jammy tomatoes piled on toasted sourdough with sea salt and good olive oil. A late-summer ritual.',
      'The roasting oil is liquid gold — save any leftover in a small jar for pasta the next day. Works equally well with cherry tomatoes; reduce roasting time to 50 minutes.',
      '2026-04-12T09:14:00.000Z'
    ) returning id
  ),
  rt as (
    insert into recipe_types (recipe_id, type_id)
    select id, t from r, unnest(array['starter'::text, 'italian'::text]) as t
  ),
  ing as (
    insert into ingredients (recipe_id, amount, name)
    select r.id, v.amt, v.nm from r, (values
      ('8',           'ripe vine tomatoes'),
      ('4 tbsp',      'extra virgin olive oil'),
      ('1 tsp',       'flaky sea salt'),
      ('2 sprigs',    'thyme'),
      ('4 thick slices','sourdough'),
      ('1 clove',     'garlic, halved')
    ) as v(amt, nm)
  )
insert into steps (recipe_id, "order", description)
select r.id, v.ord, v.dsc from r, (values
  (1, 'Heat oven to 140°C / 285°F. Halve the tomatoes and lay them cut-side up on a parchment-lined tray.'),
  (2, 'Drizzle generously with olive oil, scatter thyme and salt. Roast for 1 hour 45 minutes until shrunken and sweet.'),
  (3, 'Toast the sourdough until deeply golden. Rub each slice with the cut side of the garlic clove.'),
  (4, 'Pile tomatoes onto the toast. Spoon over the rich oil from the tray. Finish with extra salt.')
) as v(ord, dsc);


-- Miso Butter Mushrooms
with
  r as (
    insert into recipes (title, description, notes, created_at) values (
      'Miso Butter Mushrooms',
      'Earthy mushrooms glazed in a salty-sweet miso butter. Twenty minutes start to finish.',
      'Don''t crowd the pan — work in two batches if needed. The browning is what makes this dish.',
      '2026-03-28T18:42:00.000Z'
    ) returning id
  ),
  rt as (
    insert into recipe_types (recipe_id, type_id)
    select id, t from r, unnest(array['asian'::text, 'main'::text]) as t
  ),
  ing as (
    insert into ingredients (recipe_id, amount, name)
    select r.id, v.amt, v.nm from r, (values
      ('500g',   'mixed mushrooms (oyster, shiitake, chestnut)'),
      ('3 tbsp', 'unsalted butter'),
      ('2 tbsp', 'white miso paste'),
      ('1 tbsp', 'soy sauce'),
      ('1 tsp',  'rice vinegar'),
      ('2',      'spring onions, sliced'),
      ('1 tsp',  'toasted sesame seeds')
    ) as v(amt, nm)
  )
insert into steps (recipe_id, "order", description)
select r.id, v.ord, v.dsc from r, (values
  (1, 'Tear larger mushrooms into bite-sized pieces. Leave smaller ones whole — variety in shape is the point.'),
  (2, 'Whisk the miso, soy, and rice vinegar in a small bowl until smooth. Set aside.'),
  (3, 'Heat a wide pan over high heat. Add butter; once it foams, add mushrooms in a single layer. Don''t stir for 3 minutes — let them brown.'),
  (4, 'Toss and cook another 4 minutes. Pour in the miso mixture and stir until everything is glossy and coated.'),
  (5, 'Off the heat, scatter spring onions and sesame seeds. Serve over rice or thick toast.')
) as v(ord, dsc);


-- Almond Olive Oil Cake
with
  r as (
    insert into recipes (title, description, notes, created_at) values (
      'Almond Olive Oil Cake',
      'Tender, fragrant, and forgiving. Keeps for days and tastes better on the second.',
      'Use a fruity, peppery olive oil — it''s a flavour, not a fat substitute. A dollop of crème fraîche and a few raspberries on the side is all this needs.',
      '2026-02-15T11:20:00.000Z'
    ) returning id
  ),
  rt as (
    insert into recipe_types (recipe_id, type_id)
    select id, t from r, unnest(array['dessert'::text, 'italian'::text]) as t
  ),
  ing as (
    insert into ingredients (recipe_id, amount, name)
    select r.id, v.amt, v.nm from r, (values
      ('200g',  'ground almonds'),
      ('100g',  'fine semolina'),
      ('180g',  'caster sugar'),
      ('3 large','eggs'),
      ('180ml', 'good olive oil'),
      ('2',     'lemons, zest and juice'),
      ('1 tsp', 'baking powder'),
      ('pinch', 'fine sea salt')
    ) as v(amt, nm)
  )
insert into steps (recipe_id, "order", description)
select r.id, v.ord, v.dsc from r, (values
  (1, 'Heat oven to 170°C / 340°F. Line a 22cm round tin with parchment.'),
  (2, 'Whisk eggs and sugar in a large bowl until pale and slightly thickened, about 2 minutes.'),
  (3, 'Stream in the olive oil while whisking, then add lemon zest and juice.'),
  (4, 'Fold in the dry ingredients gently — don''t overmix. The batter should be loose and fragrant.'),
  (5, 'Pour into the tin, smooth the top, and bake 40–45 minutes until a skewer comes out with a few moist crumbs.'),
  (6, 'Cool in the tin for 15 minutes, then turn out. Dust with icing sugar to serve.')
) as v(ord, dsc);


-- Leek & Potato Soup, Properly
with
  r as (
    insert into recipes (title, description, notes, created_at) values (
      'Leek & Potato Soup, Properly',
      'The classic. Buttery, silky, restrained — the kind of bowl you make on a grey Sunday.',
      'White pepper, not black — this is a soup that wants to stay pale and elegant. For a thinner soup add more stock; for a richer one, more cream. Leftovers reheat beautifully.',
      '2026-01-30T16:05:00.000Z'
    ) returning id
  ),
  rt as (
    insert into recipe_types (recipe_id, type_id)
    select id, t from r, unnest(array['main'::text, 'starter'::text]) as t
  ),
  ing as (
    insert into ingredients (recipe_id, amount, name)
    select r.id, v.amt, v.nm from r, (values
      ('4 large', 'leeks, white and pale green only'),
      ('500g',    'floury potatoes (Maris Piper, Russet)'),
      ('60g',     'unsalted butter'),
      ('1.2L',    'good chicken or vegetable stock'),
      ('150ml',   'double cream'),
      ('1',       'bay leaf'),
      ('to taste','salt, white pepper, chives')
    ) as v(amt, nm)
  )
insert into steps (recipe_id, "order", description)
select r.id, v.ord, v.dsc from r, (values
  (1, 'Slice the leeks finely and wash thoroughly in cold water — grit hides in the layers.'),
  (2, 'Melt butter in a heavy pot over low heat. Add leeks and a pinch of salt. Sweat for 15 minutes until soft and sweet, never coloured.'),
  (3, 'Peel and dice potatoes into 1cm cubes. Add to the pot with the bay leaf and stock.'),
  (4, 'Simmer gently for 20 minutes until potatoes are completely tender. Remove the bay.'),
  (5, 'Blend until silky-smooth. Stir in the cream, season carefully with salt and white pepper.'),
  (6, 'Serve with a swirl of cream, snipped chives, and a final crack of pepper.')
) as v(ord, dsc);
