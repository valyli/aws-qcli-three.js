# 零代码生成 3D 游戏：基于 Amazon Q Developer CLI 和 Three.js 的实践

**Amazon Q Developer** 是一个由生成式人工智能（AI）驱动的对话助手，可帮助你理解、构建、扩展和运维 AWS 应用程序。你可以向它询问关于 AWS 架构、你的 AWS 资源、最佳实践、官方文档、技术支持等问题。Amazon Q 不断更新其能力，确保为你的问题提供最具上下文相关性和可操作性的答案。

**Amazon Q Developer CLI** 能整合上下文信息，使 Amazon Q 更深入理解你的使用场景，从而提供相关且具有上下文感知的响应。当你开始输入命令时，Amazon Q 会自动补全相关的子命令、选项和参数。

**three.js** 是一个构建于 WebGL 之上的轻量级 3D 游戏引擎。它是一个 JavaScript 3D 库，使开发者可以轻松地在浏览器中使用 WebGL 创建和展示动画 3D 图形。three.js 屏蔽了底层图形 API 的复杂性，允许开发者用简洁、高层次的代码构建沉浸式、交互式的 3D 体验。无论你是在创建数据可视化、仿真系统、游戏，还是产品展示，three.js 都能以高性能、灵活性和易用性，帮助你将创意变为现实。


# 客户场景
游戏行业的客户，在发行游戏产品时，需要制作大量的广告视频素材用于投放。因为广告素材的生命一般都很短，只有几天时间。客户为了保证广告投放效果稳定，必须持续制作大量视频素材，进行AB Test。这占用了他们大量的研发和美术人力资源。所以，客户为了提升生产效率，降低人力成本，希望利用生成式人工智能来帮助他们。
又因为游戏行业的特性，这些广告素材的内容区别于其他行业的传统广告。它们通常使用的是自己游戏的美术设计，例如：角色的3D模型、卡通界面、技能特效等。因为和真实世界的场景差别很大，这使得目前主流的生成式模型无法帮助他们生成广告视频。并且在视频中，客户经常要求多个游戏角色按编排的剧情互动，表演的剧情。这也超出了目前主流的生成式模型的能力范围。

# 解决方案
使用 Amazon Q Developer CLI 的方式，引入 Amazon Q 强大的人工智能能力，结合 three.js 3D游戏引擎，生成mini游戏。再通过视频录制，生成视频广告素材。客户通过替换自己游戏的美术资源，实现批量生成视频素材，满足AB Test的数量需求。通过 Amazon Q Developer CLI 的对话方式，可以在不写代码的情况下改编演出剧本，使广告创意人员可以独立实现效果。three.js 可以利用桌面电脑的性能进行渲染，并可以控制渲染帧率实现类似离线渲染的能力，获得更好的画面效果。同时因为 three.js 是开源项目，Amazon Q 可以使用 three.js 的全部代码和文档，获得比其他商用闭源引擎更好的准确性。

# 方案实施步骤
1. 安装 Amazon Q for command line.
2. 克隆 three.js git 仓库到本地电脑.
3. 使用 Amazon Q Developer CLI 理解 three.js 工程的代码和文档。
4. 使用 Amazon Q Developer CLI 编写一个游戏创建计划。
5. 使用 Amazon Q Developer CLI 根据计划创建一个mini游戏工程。

# 实验验证
以下实验过程中，人工没有编写任何一行代码。也没有浏览过任何工程代码。本地环境中不需要任何编程IDE。

以下是使用到的关键提示词：

1. 使用 Amazon Q Developer CLI 理解 three.js 工程的代码和文档。
    > 这个路径下,是从three.js clone 的git库,其中包含全部的代码和文档.我想用之后利用这些信息,指导你来制作一款基于three.js的游戏.那这些资料应该如何整理?我可以使用AWS上的服务,比如Bedrock,也可以使用Knowledgebase.给出最合理和最正确的建议.我需要稳定和可靠的工作质量.

2. 提出创建小游戏的具体要求，并要求 Amazon Q Developer 先制定计划。此步骤结束时，mini游戏工程已经创建完成，并可以在浏览器中运行。
   > 创建一个赛车的小游戏,放到这个路径 /Users/valyli/three-js-demo . 创建之前,先做规划,确定创建的步骤.把这个计划写入一个markdown文档.后续创建过程中,每一个步骤都重新与这个计划文档进行核对,并标注完成的状态.通过这个方法来确保创建过程的质量,保证最终输出的游戏工程可以正确运行.在这个版本中,最重要的是做出这个小游戏,能够正常演示.并不需要复杂的玩法和功能.

3. 修复BUG。可以看到，对于3D场景，模型在坐标系上的处理还稍显逊色。需要辅助输入更多的调试信息才能修正。
    > 现在游戏已经能够运行,车子也可以控制.但是有一些bug:
    1. 车子的左右方向控制反了
    2. 车子的方向控制,参照系好像不是车子本身

    > 新的问题,镜头跑到车的下面了.应该是在车的上方,跟随在斜后方的位置

    > 前进和后退的参照系,需要以车体的坐标系为准

    > W和S键,控制方向的逻辑不对.当车体发生方向旋转后,W和S的操作结果就混乱了.重新检查这2个按键的控制逻辑.一定要根据车头当前的方向来判断.

    > W产生的推力,必须沿车头方向向前;S产生的推力,必须沿车尾方向向后.你现在提供的程序,没有实现这个效果.这部分代码重新生成

    > 还是一模一样的问题,没有修复.发现一个现象,当车从初始位置出发,转向超过180度后,W和S键作用对调了

    > 这次修改后,W和S键已经无效了

    > 还是不动

4. 添加物理碰撞。结束整个生成过程。
    > 现在按键控制已经正确.我还是希望能有物理模型,以及碰撞的功能.请添加


# 生成效果展示
![alt text](./doc_assets/image.png)
![alt text](./doc_assets/demo.gif)


# 生成过程记录
[record](./amazon-q-cli-record.md)


# 生成的demo工程
[project code](./three-js-demo/)

# 对照组测试
在对照组测试中，我们向 Amazon Q Developer CLI 提出同样的要求，但不再提供 three.js 的代码和文档。观察它的生成过程。

1. 移除理解 three.js 工程和文档的部分。然后输入一样的提升词，要求生成一个小游戏。
    > 创建一个赛车的小游戏,放到这个路径 /Users/valyli/three-js-demo-2 . 创建之前,先做规划,确定创建的步骤.把这个计划写入一个markdown文档.后续创建过程中,每一个步骤都重新与这个计划文档进行核对,并标注完成的状态.通过这个方法来确保创建过程的质量,保证最终输出的游戏工程可以正确运行.在这个版本中,最重要的是做出这个小游戏,能够正常演示.并不需要复杂的玩法和功能.

2. 观察生成过程，发行这次 Amazon Q Developer CLI 执行了 three.js 的安装步骤。


    ```bash
    🛠️  Using tool: execute_bash (trusted)
    ⋮ 
    ● I will run the following shell command: 
    cd /Users/valyli/three-js-demo-2 && npm install three@0.159.0 serve@14.2.1
    ⋮ 
    ↳ Purpose: 安装项目依赖


    added 91 packages, and audited 92 packages in 7s

    24 packages are looking for funding
    run `npm fund` for details

    3 high severity vulnerabilities

    To address all issues, run:
    npm audit fix --force

    Run `npm audit` for details.
    ```

3. 我们利用其中的关键步骤，three.js 的库引用方式进行分析。
   1. 对照组
    ```bash
    npm install three@0.159.0 serve@14.2.1
    ```
    这个安装命令在 three.js 官方文档无法找到。所以是 Amazon Q Developer CLI 根据模型已有的知识生成。
   
    2. demo
   ```html
    <!-- 引入 Three.js 库 -->
    <script src="https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.min.js"></script>
   ```
   这个引用方式，可以在官方文档中找到。说明 Amazon Q Developer CLI 在按照要求理解文档后执行的生成。
   相关文档：https://threejs.org/manual/#en/installation

所以，通过要求 Amazon Q Developer CLI 理解指定文档和代码的方式，能够更准确的按照我们的意愿生成内容。我们可以通过这样的方式，为模型输入更高质量的信息，以及我们需求中特有的信息。

# 附录

1. Amazon Q for command line 安装说明

https://docs.aws.amazon.com/amazonq/latest/qdeveloper-ug/command-line-installing.html

2. three.js github 地址

https://github.com/mrdoob/three.js
