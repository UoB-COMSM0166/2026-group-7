# Obstacle System
## large car
| Field                  | Specification                                                                   |
| ---------------------- | ------------------------------------------------------------------------------- |
| Variants               | Bus / Ambulance / Truck / Fire Engine                                           |
| Effect                 | -5 HP (Instant Death)                                                           |
| Speed                  | 0.6–0.8 × Player Current Speed                                                  |
| Max Concurrent         | Level 0–2: Max 1 on screen<br>Level 3–4: Max 2 (cannot spawn in parallel lanes) |
| Consecutive Spawn Rule | Only allowed in Level 3–4; spawn interval ≥ 2 seconds                           |
| Mutual Exclusion       | Cannot spawn while a Promoter flyer is active                                   |
| Allowed Lanes          | Lane 1, Lane 2                                                                  |
| Safety Rule            | Cannot spawn at immediate collision distance in the player’s                    |

## small car
| Field                  | Specification                                                                                       |
| ---------------------- | --------------------------------------------------------------------------------------------------- |
| Variants               | Police Car / Colored Sedans / Tractor                                                               |
| Effect                 | -2 HP (Death occurs after 3 consecutive collisions)                                                 |
| Speed                  | 0.9–1.1 × Player Current Speed (Police car is fastest and includes siren SFX)                       |
| Max Concurrent         | Multiple allowed on screen                                                                          |
| Consecutive Spawn Rule | Must always leave at least one safe lane available                                                  |
| Mutual Exclusion       | None                                                                                                |
| Allowed Lanes          | Lane 1, Lane 2                                                                                      |
| Collision Rule         | Death triggered after 3 consecutive small car collisions; reset if no collision occurs between hits |

## scooter (occupied)
| Field            | Specification                                                                           |
| ---------------- | --------------------------------------------------------------------------------------- |
| Effect           | 0.5s stun + 0.5s lane-change delay + 1s camera shake                                    |
| Speed            | 1.2 × Player Current Speed                                                              |
| Max Concurrent   | Level 0: Max 1<br>Level 1–4: Max 4 per level                                            |
| Spawn Interval   | At most 1 every 20 seconds                                                              |
| Mutual Exclusion | None                                                                                    |
| Allowed Lanes    | Lane 1, Lane 2 + Sidewalk 1, Sidewalk 2                                                 |
| Behavior Rule    | Random lane switching across all four lanes; minimum lane-change interval ≥ 1.5 seconds |

## scooter (empty)
| Field            | Specification                                                                                            |
| ---------------- | -------------------------------------------------------------------------------------------------------- |
| Effect           | Auto-pickup helmet; 5 seconds immunity to all obstacles (including large cars); total duration 7 seconds |
| Speed            | 1.2 × Player Current Speed                                                                               |
| Max Concurrent   | Increases in later levels (recommended: max 1 on screen)                                                 |
| Spawn Cooldown   | ≥ 15 seconds                                                                                             |
| Mutual Exclusion | None                                                                                                     |
| Allowed Lanes    | Lane 1, Lane 2 + Sidewalk 1, Sidewalk 2                                                                  |
| Stacking Rule    | Same-type effects do not stack; duration refresh only                                                    |

## homeless
| Field                  | Specification                                               |
| ---------------------- | ----------------------------------------------------------- |
| Variants               | 2–3 different appearances                                   |
| Effect                 | Forces player to switch to the opposite lane upon collision |
| Speed                  | Static (background-based)                                   |
| Max Concurrent         | 1–2 per level                                               |
| Consecutive Spawn Rule | Cannot spawn consecutively                                  |
| Mutual Exclusion       | Cannot coexist with large cars                              |
| Allowed Lanes          | Sidewalk 1, Sidewalk 2                                      |
| Dialogue Rule          | Dialogue box increases blocking area as days progress       |

## promoter
| Field            | Specification                                                                                                    |
| ---------------- | ---------------------------------------------------------------------------------------------------------------- |
| Variants         | Level 0: 1 tutorial version<br>Level 1–2: 3 normal flyers<br>Level 3–4: 3 corrupted flyers                       |
| Effect           | Player presses Space 15 times → flyer crumples into a paper ball → clears the first obstacle in the current lane |
| Max Concurrent   | Recommended: Max 1 on screen                                                                                     |
| Spawn Rule       | While flyer overlay is active, large cars cannot spawn                                                           |
| Mutual Exclusion | Mutually exclusive with large cars                                                                               |
| Allowed Lanes    | Sidewalk 1, Sidewalk 2                                                                                           |
| Trigger Rule     | Paper ball effect applies immediately upon firing                                                                |

## waether system

## coffee(buff item)
