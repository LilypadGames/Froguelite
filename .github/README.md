<p align="center">
  <a align="center" href='#'/>
    <img src="logo.svg" height="200rem" alt="Logo" />
  </a>
</p>

<hr>

## **Languages**

-   [Typescript](https://www.typescriptlang.org/)
-   [Rust](https://www.rust-lang.org/)

## **Tools**

-   [Vite](https://vitejs.dev/)
-   [Tauri](https://tauri.app/)
-   [Phaser 3](https://phaser.io/)

## **Inspirations**

-   Binding of Isaac: Dungeon Crawling & Character Building
-   Realm of the Mad God: Combat Mechanics and Controls
-   The Legend Of Zelda: Dungeon Puzzle Solving

<hr>

## **Contribute**

There are two ways to contribute.

### **Donations**

I am currently working alone on this project- creating both the assets and the code. I do not have a job and am attending university, so any donations would help a ton. I could use the money to hire artists, since art is not my strong suite and I want this game to be the best it could be. (I am currently using a 5$ spritesheet lol).

<p align="center" style="display: flex; justify-content: center; align-items: center;">
    <a href="https://www.paypal.com/paypalme/DanMizu" target="_blank" style="padding: 1%">
        <img height="60rem" src="paypal-donate-button.webp" alt="Donations"/>
    </a>
</p>

### **Developing**

Typescript is easy to develop with, as it is essentially just Javascript with type-safety. This project uses the Phaser game framework which makes it really easy to use JS knowledge to make a game for the web, and with the Tauri framework, we can then easily wrap web apps into a standalone cross-platform desktop app.

You can clone this repository, make changes, and then submit a push request. Reach out to me on Discord (Dan Mizu#8420) if you are interested or have absolutely ANY questions.

1. **Install Node.js/npm, Rust, and Visual Studio Code**

You can install Node.JS from: <https://nodejs.org/en/>

The LTS is fine. It should also install npm (a package manager) as well.

You can install Rust from: <https://www.rust-lang.org/tools/install>

Visual Studio Code is a great editor for web development and is obtained from: <https://code.visualstudio.com/>

You can use any other editor, though this project is configured with tasks and run configurations for VSCode.

2. **Clone this Repo**

Theres a button for this at the top right of this repo. I personally use the Github Desktop app to clone repos easily.

3. **Open the Repo in Visual Studio Code and Install Dependencies**

You can open the repo directly from Github Desktop after its been cloned. Use the shortcut CTRL+SHIFT+P (CMD+SHIFT+P on MacOS) and type and/or select `Task: Run Tasks`, then `Install Dependencies`.

4. **Develop**

The games code is within the "src" directory and the game's assets are within "src/assets".

The main game scene is "src/scenes/Game.ts". I recommend skimming through it all to understand how it works.

5. **Debug**

If using VSCode, you can use the "Run and Debug" tab on the left to run different configurations. `Dev | Web` will start a Vite server that can be accessed from the URL it gives you in the console. `Dev | Tauri` will run the Vite server, build the app, then launch it.

If you want to build the app yourself, you can use the `Build` task.

6. **Submit Changes For Review and Merging**

When you're finished implementing a new feature/mechanic, push your changes to the repo and then submit a PR. This process is detailed here: <https://github.com/firstcontributions/first-contributions>.
