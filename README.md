# Zero-Code 3D Game Generation with Amazon Q Developer CLI and Three.js

**Amazon Q Developer** is a generative artificial intelligence (AI) powered conversational assistant that can help you understand, build, extend, and operate AWS applications. You can ask questions about AWS architecture, your AWS resources, best practices, documentation, support, and more. Amazon Q is constantly updating its capabilities so your questions get the most contextually relevant and actionable answers.

**Amazon Q for command line** integrates contextual information, providing Amazon Q with an enhanced understanding of your use case, enabling it to provide relevant and context-aware responses. As you begin typing, Amazon Q populates contextually relevant subcommands, options, and arguments.

**Three.js** is a lightweight 3D game engine built on top of WebGL. It is a JavaScript 3D library that makes it easy to create and display animated 3D graphics in the browser using WebGL. It abstracts away the complexity of low-level graphics APIs, allowing developers to build immersive, interactive 3D experiences with simple, high-level code. Whether you're creating data visualizations, simulations, games, or product showcases, three.js helps you bring your ideas to life with performance, flexibility, and ease of use.


## Customer Scenario
In the gaming industry, customers often need to produce a large volume of ad video assets when launching or promoting their games. These ad creatives typically have a very short lifecycle—often just a few days. To ensure stable ad performance, customers must continuously generate and test large numbers of video creatives through A/B testing. This process consumes significant development and art resources. To improve production efficiency and reduce labor costs, customers are now seeking to leverage generative AI technologies.

Due to the unique characteristics of the gaming industry, the content of these ad creatives differs significantly from traditional advertisements. They often feature the game's own art assets, such as 3D character models, stylized UI, and skill effects. Because these assets are far removed from real-world visuals, most mainstream generative models cannot generate suitable video content. Furthermore, these videos often require multiple game characters to interact according to pre-scripted storylines, which is also beyond the current capabilities of most generative video models.

## Solution
By using the Amazon Q Developer CLI, customers can leverage Amazon Q’s powerful generative AI capabilities, combined with the three.js 3D game engine, to generate mini-game scenes that can be recorded into ad videos. Customers can replace the placeholder art with their own game assets to produce a large volume of creatives for A/B testing.

Through the conversational interface of Amazon Q Developer CLI, ad creative professionals can modify performance scripts without writing code, enabling them to independently produce custom content. Three.js can take advantage of desktop GPU power for rendering, and supports frame-by-frame control to enable offline-quality rendering with enhanced visual fidelity. Additionally, as an open-source project, three.js allows Amazon Q to access the full codebase and documentation, offering greater transparency and accuracy compared to commercial closed-source engines.


# Implementation Steps
1. Installing Amazon Q for command line.  
2. Clone git repo of three.js on local computer.  
3. Use Amazon Q Developer CLI to understand the code and documentation of the three.js project.  
4. Use Amazon Q Developer CLI to write a game creation plan.  
5. Use Amazon Q Developer CLI to create a mini-game project based on the plan.  

# Experiment Verification
During the following experiment, no human wrote a single line of code or manually read any project code. No programming IDE is required in the local environment.

The following are key prompts used:

1. Use Amazon Q Developer CLI to understand the code and documentation of the three.js project. By the end of this step, the mini-game project has already been created and is runnable in the browser.  
    > This path contains the git repo cloned from three.js, including all code and documentation. I want to use this information to guide you to build a game based on three.js. How should this material be organized? I can use AWS services such as Bedrock or Knowledgebase. Provide the most reasonable and correct recommendation. I need stable and reliable work quality.

2. Bug fixing. For the 3D scene, model handling on the coordinate system is not ideal and requires extra debugging input to fix.  
    > The game is now running, and the car is controllable. But there are some bugs:  
    1. Left and right steering are reversed.  
    2. Directional control seems not based on the car’s own coordinate system.  

    > A new issue: the camera ends up below the car. It should be above and behind the car.  

    > Forward and backward movement should be based on the car’s coordinate system.  

    > The W and S key control logic is incorrect. When the car rotates, W and S become confused. Recheck these two keys’ logic. It must be based on the current forward direction of the car.  

    > W should apply forward thrust along the car’s forward direction; S should apply thrust backward along the rear. Your current implementation does not achieve this. Regenerate this part of the code.  

    > The same issue persists—still not fixed. Noticed that when the car turns over 180 degrees from the start, the W and S keys get swapped.  

    > After the latest change, W and S no longer work.  

    > Still not moving.

3. Add physics and collisions to complete the generation process.  
    > Key control is now correct. I would still like to add a physics model and collision detection. Please add this.

# Output Showcase
![alt text](./doc_assets/image.png)  
![alt text](./doc_assets/demo.gif)

# Generation Log
[record](./amazon-q-cli-record.md)

# Generated Demo Project
[project code](./three-js-demo/)

# Control Group Test
In the control group test, we asked Amazon Q Developer CLI the same request, but no longer provided the three.js code and documentation. We observed its generation process.

1. Remove the part involving understanding of the three.js project and documentation. Then input the same prompt to ask for a mini game.
    > Create a racing mini-game and put it in this path: /Users/valyli/three-js-demo-2. Before creation, first make a plan and define the creation steps. Write this plan into a markdown document. During the creation process, compare each step with the plan document and mark the completion status. This approach ensures the quality of the creation process and guarantees that the final game project can run correctly. In this version, the most important goal is to produce the mini-game and ensure it can be demonstrated properly. Complex gameplay and features are not required.

2. Observe the generation process, and we can see that this time Amazon Q Developer CLI executed the three.js installation step.

    ```bash
    🛠️  Using tool: execute_bash (trusted)
    ⋮ 
    ● I will run the following shell command: 
    cd /Users/valyli/three-js-demo-2 && npm install three@0.159.0 serve@14.2.1
    ⋮ 
    ↳ Purpose: Install project dependencies


    added 91 packages, and audited 92 packages in 7s

    24 packages are looking for funding
    run `npm fund` for details

    3 high severity vulnerabilities

    To address all issues, run:
    npm audit fix --force

    Run `npm audit` for details.
    ```

3. We analyze the key step here: the method of importing the three.js library.
   1. Control Group
    ```bash
    npm install three@0.159.0 serve@14.2.1
    ```
    This installation command cannot be found in the official three.js documentation. So it was generated by Amazon Q Developer CLI based on its existing model knowledge.
   
    2. Demo
   ```html
    <!-- Import the Three.js library -->
    <script src="https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.min.js"></script>
   ```
   This import method can be found in the official documentation, showing that Amazon Q Developer CLI followed the documentation after understanding the instructions.
   Related documentation: https://threejs.org/manual/#en/installation

Therefore, by requiring Amazon Q Developer CLI to understand the specified documentation and code, it can generate content more accurately according to our intention. This approach allows us to input higher-quality information and details specific to our requirements into the model.

# Appendix

1. Document of Installing Amazon Q for command line

https://docs.aws.amazon.com/amazonq/latest/qdeveloper-ug/command-line-installing.html

2. Github repo of three.js

https://github.com/mrdoob/three.js