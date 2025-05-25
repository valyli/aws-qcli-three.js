# Build three.js game with Amazon Q Developer CLI

**Amazon Q Developer** is a generative artificial intelligence (AI) powered conversational assistant that can help you understand, build, extend, and operate AWS applications. You can ask questions about AWS architecture, your AWS resources, best practices, documentation, support, and more. Amazon Q is constantly updating its capabilities so your questions get the most contextually relevant and actionable answers.

**Amazon Q for command line** integrates contextual information, providing Amazon Q with an enhanced understanding of your use case, enabling it to provide relevant and context-aware responses. As you begin typing, Amazon Q populates contextually relevant subcommands, options, and arguments.

**three.js** is a lightweight 3D game engine built on top of WebGL. It is a JavaScript 3D library that makes it easy to create and display animated 3D graphics in the browser using WebGL. It abstracts away the complexity of low-level graphics APIs, allowing developers to build immersive, interactive 3D experiences with simple, high-level code. Whether you're creating data visualizations, simulations, games, or product showcases, three.js helps you bring your ideas to life with performance, flexibility, and ease of use.


# 客户场景
游戏行业的客户，在发行游戏产品时，需要制作大量的广告视频素材用于投放。因为广告素材的生命一般都很短，只有几天时间。客户为了保证广告投放效果稳定，必须持续制作大量视频素材，进行AB Test。这占用了他们大量的研发和美术人力资源。所以，客户为了提升生产效率，降低人力成本，希望利用生成式人工智能来帮助他们。
又因为游戏行业的特性，这些广告素材的内容区别于其他行业的传统广告。它们通常使用的是自己游戏的美术设计，例如：角色的3D模型、卡通界面、技能特效等。因为和真实世界的场景差别很大，这使得目前主流的生成式模型无法帮助他们生成广告视频。并且在视频中，客户经常要求多个游戏角色按编排的剧情互动，表演的剧情。这也超出了目前主流的生成式模型的能力范围。

# 解决方案
使用 Amazon Q Developer CLI 的方式，引入 Amazon Q 强大的人工智能能力，结合 three.js 3D游戏引擎，生成mini游戏。再通过视频录制，生成视频广告素材。客户通过替换自己游戏的美术资源，实现批量生成视频素材，满足AB Test的数量需求。通过 Amazon Q Developer CLI 的对话方式，可以在不写代码的情况下改编演出剧本，使广告创意人员可以独立实现效果。three.js 可以利用桌面电脑的性能进行渲染，并可以控制渲染帧率实现类似离线渲染的能力，获得更好的画面效果。同时因为 three.js 是开源项目，Amazon Q 可以使用 three.js 的全部代码和文档，获得比其他商用闭源引擎更好的准确性。

# 方案实施步骤
1. Installing Amazon Q for command line.
2. Clone git repo of three.js on local computer.
3. 使用 Amazon Q Developer CLI 理解 three.js 工程的代码和文档。
4. 使用 Amazon Q Developer CLI 编写一个游戏创建计划。
5. 使用 Amazon Q Developer CLI 根据计划创建一个mini游戏工程。

# 实验验证
以下实验过程中，人工没有编写任何一行代码。也没有浏览过任何工程代码。本地环境中不需要任何编程IDE。

以下是使用到的关键提示词：

1. 使用 Amazon Q Developer CLI 理解 three.js 工程的代码和文档。此步骤结束时，mini游戏工程已经创建完成，并可以在浏览器中运行。
    > 这个路径下,是从three.js clone 的git库,其中包含全部的代码和文档.我想用之后利用这些信息,指导你来制作一款基于three.js的游戏.那这些资料应该如何整理?我可以使用AWS上的服务,比如Bedrock,也可以使用Knowledgebase.给出最合理和最正确的建议.我需要稳定和可靠的工作质量.

1. 修复BUG。可以看到，对于3D场景，模型在坐标系上的处理还稍显逊色。需要辅助输入更多的调试信息才能修正。
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

3. 添加物理碰撞。结束整个生成过程。
    > 现在按键控制已经正确.我还是希望能有物理模型,以及碰撞的功能.请添加


# 生成效果展示
![alt text](./doc_assets/image.png)
![alt text](./doc_assets/demo.gif)


# 生成过程记录
[record](./amazon-q-cli-record.md)


# 生成的demo工程
[project code](./three-js-demo/)

# 附录

1. Installing Amazon Q for command line

https://docs.aws.amazon.com/amazonq/latest/qdeveloper-ug/command-line-installing.html

2. three.js

https://github.com/mrdoob/three.js
