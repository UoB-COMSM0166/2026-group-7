# Park Street Survivor

## Interface

- Start page
  - Start
    - -> Time wheel(Day 1)
      - -> Day 1 room
  - Resume
    - -> Choose date
  - Setting
    - -> Volume
    - -> Share

- Day 1 room
  - -> Desk
    - Not compulsory at the moment
    - -> Backpack(Spilt the screen)
      - -> (Left half)Bag
      - -> (Right half)Table with things on top to choose
      - -> (Left top)Exit
  - -> Door(Exit)
    - -> Day 1 climb
  - -> Bed(Next to player initial location)

- Day 1 climb
  - -> Top
    - Health bar
    - Distance to uni
    - Effects showing
    - Clock
    - -> Stop button
  - -> Roads
    - -> Obstacles
    - -> Tools
  - -> To the top
    - -> Enter the Wills Memorial Building
      - -> Meet npc 1
  - -> Fail
    - Hit by large cars
    - Not enough health bar
    - Late for uni


## Obstacles

- Mobile
  - Large Cars
    - e.g.
      - Bus
      - Ambulance
      - Fire Truck
    - Effect
      - Immediately die
  - Small Cars
    - e.g.
      - Any normal cars
      - Police Car
    - Effect
      - Decrease blood
      - Bounce back for several meters(?)
  - Scooter
    - Effect
      - Decrease blood
      - Bounce back for several meters(?)

- Static
  - Homeless
    - Effect
      - Dialog box covering part of the road
      - Bounce to the opposite side
  - Promoter
    - Effect
      - Flyer covering eyesight
      - Press space to throw the flyer away
        - Flyer attacks any obstacles in front of player
  - Paddle
    - Effect
      - Half-transparent rain and dirt cover half of the eyesight
      - Slow the player's speed

## Street Layout

| Zone | Coordinate Range (X) | Width | Purpose |
| :--- | :--- | :--- | :--- |
| Left Scenery | 0 - 500 | 500px | Art Integration (Houses/Trees) |
| Left Sidewalk | 500 - 700 | 200px | NPC / Pavement Hazards |
| Lane 1 | 700 - 960 | 260px | Left Vehicle Lane |
| Lane 2 | 960 - 1220 | 260px | Right Vehicle Lane |
| Right Sidewalk | 1220 - 1420 | 200px | NPC / Pavement Hazards |
| Right Scenery | 1420 - 1920 | 500px | Art Integration (Houses/Trees) |