<p align="center">
  <a align="center" href='#'/>
    <img src="logo.svg" height="200rem" alt="Logo" />
  </a>
</p>

<hr>

## **Languages & Tools**

-   Typescript
-   Phaser 3 (or 4 if thats ever out)
-   Electron

## **Inspirations**

-   Binding of Isaac: Dungeon Crawling & Character Building
-   Realm of the Mad God: Combat Mechanics and Controls
-   Kirby: Character Abilities

## **Details**

-   Speedrun Mechanic
-   All Sprites/Objects have a slim black outline, black outer glow, and circular shadow beneath them with its size dependant on the sprites size.
-   2 layer Tilemap. One for the ground and one for walls.
-   Rotatable Camera
-   Fog of War mechanic
-   Keyboard to Move, Mouse to Attack/Use Abilities
-   Randomly Generated Dungeons
-   A ton of items to make every playthrough unique

## **Storyboard**

-   Start with a frog on a lilypad.
-   A little fairy or something flies overhead and the frog eats it with its long ass tongue, mistaking it for a fly.
-   A magical puff of smoke or something appears around the frog shortly after, and the frog has become anthropomorphic (stands on two legs) and has a wand and wizard hat.
-   The frog jumps off screen.
-   A new scene begins with the frog at the edge of the river, in front of where the fairy must have come from- a small mystical cave opening.

<hr>

## **Contribute**

There are two ways to contribute.

### **Donations**

I am currently working alone on this project- creating both the assets and the code. I do not have a job and am attending university, so any donations would help a ton. I could use the money to hire artists, since art is not my strong suite and I want this game to be the best it could be.

<p align="center" style="display: flex; justify-content: center; align-items: center;">
    <a href="https://www.paypal.com/paypalme/DanMizu" target="_blank" style="padding: 1%">
        <img height="60rem" src="paypal-donate-button.webp" alt="Donations"/>
    </a>
</p>

### **Developing**

Javascript/Typescript is a relatively simple language and is very easy to develop with. This project uses the Phaser game framework which makes it really easy to use JS knowledge to make a game for the web, and with the Electron framework, we can then easily wrap web apps into a standalone desktop app.

You can fork this repository to your profile and make changes, and we can then merge them into this main repo. Reach out to me on Discord (Dan Mizu#8420) if you are interested or have absolutely ANY questions.

1. **Install Node.js, Yarn, and Visual Studio Code**

You can install Node.JS from <https://nodejs.org/en/>

The LTS is fine. It should also install npm (a package manager) as well.

You can then install Yarn within a terminal/console on your PC with the command: `npm install --global yarn`

Visual Studio Code (which is also developed with Electron and, by extension, Javascript by the way) is a great editor for web development and is obtained from <https://code.visualstudio.com/>

1. **Fork this Repo**

Theres a button for this at the top right of this repo.

2. **Clone the forked Repo to your PC**

I personally use the Github Desktop app to clone repos attached to my profile easily.

3. **Open the Repo in Visual Studio Code and install Dependencies**

You can open the repo directly from Github Desktop after its been cloned. Navigate to the Run and Debug tab on the left hand side of Visual Studio Code. Select and run both the Install (Client) and Install (Electron) options from the dropdown at the top.

4. **Develop**

The games code is within the client/src directory and the game's assets are within client/assets. client/src/scenes/Game.ts is where all the main Game scene's code is. I recommend skimming through it all to understand how it works.

5. **Submit Changes For Review and Merging**

When you're finished implementing a new feature/mechanic, push your changes to your repo and then submit them for review. This process is detailed here: <https://github.com/firstcontributions/first-contributions>.
