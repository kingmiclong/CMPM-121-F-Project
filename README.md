# Devlog Entry - [11/19/2023]

## Introducing the team
- Tools Lead: JustInTime
- Engine Lead: MicLong
- Design Lead: NoComp

## Tools and materials
### Engine/Library/Framework: Phaser 3
- **Description:** Phaser 3 is a popular and versatile HTML5 game framework for building 2D games using JavaScript.
- **Motivation:** Phaser 3 is easy to use, and has been something we have learned about in previous classes. It is convenient and provides a nice starting point.

### Language: JavaScript with Phaser 3
- **Description:** JavaScript is a widely used programming language for web development. When coupled with Phaser 3, it becomes the primary language for developing your game.
- **Motivation:** JavaScript is a language that we, as a group, are fairly comfortable with. We believe that it will be a good choice for our group.

### Tools: Visual Studio Code
- **Description:** Visual Studio Code (VS Code) is a lightweight yet powerful source code editor known for its rich features, support for various programming languages, and a vast library of extensions.
- **Motivation:** VS Code seems to be a standard tool that is recommended in all of our coding classes. We figured that it fit perfectly well with this project.

## Outlook
The goal of our team is to add some aspects of realism to our game, that may not be present in other games. We are doing additional research into plant types, which can add some more immersion into our game. I think the hardest part of the project will be managing our scope, which can easily be blown out of proportion in such a short period of time. I hope to learn how to properly document and iterate on our game, while focusing on organization and planning, as well as refactoring.

# Devlog Entry - [11/29/2023]

## How we satisfied the software requirements
- **[F0.a] You control a character moving on a 2D grid:** In order to satisfy this condition, we implemented a tilemap where the player resides. Players are able to use the arrow keys to move around this grid.
- **[F0.b] You advance time in the turn-based simulation manually:** In order to satisfy this condition, we implemented a counter based on player actions. Each turn consists of 10 player actions, with sun/water levels being adjusted at the end of each turn. Plant growth also happens at the beginning of each turn.
- **[F0.c] You can reap (gather) or sow (plant) plants on the grid when your character is near them:]** In order to satisfy this condition, we allowed the user to plant seeds on the grid when they are within the garden areas by using the Q key. After planting, the user can havest the crops when they are fully grown using the W key.
- **[F0.d] Grid cells have sun and water levels. The incoming sun and water for each cell is somehow randomly generated each turn. Sun energy cannot be stored in a cell (it is used immediately or lost) while water moisture can be slowly accumulated over several turns:** In order to satisfy this condition, we implemented a formula which calculates a unique sun and water value for each square. The water value is added to the space, while the sun value is used or discarded immediately. Plants that are on these tiles consume sunlight and water.
- **[F0.e] Each plant on the grid has a type (e.g. one of 3 species) and a growth level (e.g. “level 1”, “level 2”, “level 3”):** In order to satisfy this condition, we added three different plant types. These consist of Tomato, Potato, and Eggplant. Each plant goes through different stages of growth, from seedling to level 1, 2 and 3.
- **[F0.f] Simple spatial rules govern plant growth based on sun, water, and nearby plants (growth is unlocked by satisfying conditions):** In order to satisfy this condition, we added logic so that plants have specific amounts of sunlight and water that they require. Once plants reach certain water and sunlight thresholds, they grow to the next stage.
- **[F0.g] A play scenario is completed when some condition is satisfied (e.g. at least X plants at growth level Y or above):** In order to satisfy this condition, we keep track of the total amount of T3 plants collected. Once the user has collected enough fully grown plants, they are met with a popup of a job well done.

## Reflection
After working on the F0 requirements, we realized that the scope of some of our additions might need to change. Our initial plans were to add many additional features, but with a smaller team and limited time we realized that some of those features may be too ambitious to balance and implement in a way that is both balanced and satisfying. As far as positions go as a 3 man team, we feel that the current positions are working fine. If we had more people, now might have been the time to think about swapping secondary people to different spots based on what we believe needs the most focus. As far as tools and materials go, the ones we have been using so far have felt good. We are constantly on the lookout for new tools that can improve our workflow, but have yet to find anything extraordinary that needs to be implemented.
