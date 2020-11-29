# Petri Net Design Studio (PeNDeS)

## Domain Specification

Petri nets are useful structures for modeling a variety of systems and processes. Petri nets are constructed according to 4 elements: Places, Transitions, Arcs, and Tokens. These elements are typically represented as circles, squares, lines, and small circles, respectively. Arcs connect places and transitions in a specific direction, and tokens move between places and transitions along the direction of arcs. Using these 4 basic elements, petri nets can model and simulate extremely complex systems such as distributed processes, workflows, and biological phenomena. Formally, petri nets represent directed bipartite graphs between places and transitions. Petri nets are often used in many fields including business modeling, game theory, simulation, software design, and computational biology [1].

## Use Cases

Petri nets are useful in a variety of contexts such as manufacturing, information systems, biology, and business models. Petri nets have two types of arcs: T2P arcs and P2T arcs. A T2P arc originates at a transition and ends at a place. From the transtion's perspective, this is called an "outplace". From the place's perspective, this is called an "in transition". Conversely, a P2T arcs works in a similar way: it originates at a place and arrives at a transition. From the transition's perspective this is an "inplace" and from the place's perspective this is an "out transition". With these definitions in mind, we discuss the properties and applications of 4 variants of petri nets that are detected by PeNDeS (with the name of the associated example next to each of the types): 

1. **Free-choice Petri net** - "exampleFreeChoice"
   * A free-choice petri requires that each transition has its own unique set of inplaces. In other words, the pairwise intersection of the inplaces for any 2 transitions in the petri net must be empty. This type of petri net is useful for modeling behavior such as processor networks in computing, where unidirectional channels are connected to input and output ports. When an input arrives at the input port (transition), a value is computed and sent through one of possibly multiple output ports (places), each of which is connected to some number of other channels and input ports [2]. 
2. **State machine**- "exampleStateMachine"
   * A state machine requires that every transition has exactly one inplace and one outplace. In other words, each transition represents moving from one state to another state. State machines are often used to model systems such as elevators and vending machines. This type of petri net is useful for modeling system behavior in response to inputs or environment conditions.
3. **Marked graph** - "exampleMarkedGraph"
   * A marked graph might be considered the opposite of a state machine; in this type of petri net, every place has exactly one out transition and one in transition. Marked graphs are useful for modeling concurrency, where a set of tasks is split among resources to be computed according to a  schedule or timing protocol. For example, when a computer process is forked, it creates a copy of itself to accomplish some task [3]. When this task is over, it often needs to synchronize with the parent process to continue the next set of tasks or operations on the schedule. This behavior is captured precisely with a marked graph, making this type of petri net useful for modeling concurrency and distributed processes.
4. **Workflow net** - "exampleWorkflowNet"
   * A workflow net is characterised by a source (a place with no in transitions) and a sink (a place with no out transitions). Workflow nets are useful to answer the general question of "what are the ways to get to from source to sink?" This type of petri net is useful for modeling things like the flow of control in a program or a sequence of steps that must be completed according to a specific ordering. Workflow nets are often used in checking reachability conditions of programs or processes.

## Installation and Setup

First, install the following:
- [NodeJS](https://nodejs.org/en/) (LTS recommended)
- [MongoDB](https://www.mongodb.com/)

1. Second, start mongodb locally by running the `mongod` executable in your mongodb installation (you may need to create a `data` directory or set `--dbpath`).

2. Ensure npm is up to date via `npm prune && npm install	`.
3. Then, run `webgme start` from the project root to start . Finally, navigate to `http://localhost:8888` to start using PeNDeS!

## Features

The design studio includes 3 main features that are discussed in the next section:

1. An **editor** to construct petri nets
2. An **interpreter** to classify the petri net according to the 4 types of petri nets discussed above
3. A **simulator** to verify the behavior of the constructed petri net

## Getting Started

Once PenDeS is up and running, create a project using the "PetriNet" seed. This seed provide some examples to get started designing petri nets. The main layout of the design studio is as follows: the left panel contains the **Visualizer Selector** and the elements that are contained in the current level of the project. For example, if a petri net is open in the design studio, a circle icon with a "place" label below it and a rectangle icon with a "transition" label below it should be visible in the left panel. In the **Composition** view, these can be clicked and dragged onto the central panel to insert them into an open petri net.

The right panel of the design studio contains the **Object Browser**. This is where all of the objects created in the project are kept in a hierarchical layout like that of a filesystem. Here you can find 5 examples: 1 for each of the 4 classes of petri nets discussed above, and 1 that is a good starting point with no specific classification or structure ("exampleBase"). When one of these examples is double-clicked, the petri net will open in the central editor area and its name will be displayed in the top left corner of the middle editor panel. Once opened, the petri net can be edited in the following ways: add or remove transitions or places, delete or add arcs (remember T2P and P2T!), and adding or removing tokens from places. The number of tokens at a specific place is represented by smaller black circles inside the larger place circle. If a place has over 12 tokens, a number is used to represent the tokens. Arcs are drawn by clicking and dragging from the source to the destination (small squares will display at the borders of the source and destination to guide the connection point). Tokens can be added to a place by double-clicking the place and dragging tokens in from the left panel until the desired number is reached.

Once the petri net is created/modified according to the intended design, the structure and behavior of the petri net can be verified using the interpreter and simulator. To access these features, change from the composition view to the **PetriNetVisualizer** at the top left of the **Visualizer Selector** panel. When this is clicked and the page is loaded, the petri net will be rendered similarly to the **Composition** view. To interact with the simulator and check the behavior of the petri net, move the mouse onto the center panel containing the petri net diagram. Upon mouse entry, the enabled transitions will be highlighted. An enabled transition is defined by one whose inplaces all have > 0 tokens. The current token count is visible in each of the places connected to transitions. Click a highlighted transition to see a token move from the inplaces to the outplaces of the clicked transition and observe the update to the token count when the token leaves its source and arrives at its destination. If a transition is no longer enabled, the highlight will be removed. If and when deadlock is reached, meaning there are no enabled transitions, the window will alert that deadlock has been reached and to reset the simulator to continue. If the mouses moves over the active area of the petri net in this situation, the alert repeats until the simulator is reset. This can be done using a button on the toolbar.

There are 2 buttons located in the toolbar directly above the name of the petri net in the top left corner of the central editing area. The first one from left to right, with the play symbol, will run the interpreter when clicked. This will indicate in which of the 4 classes of petri nets the current petri net belongs. If it is not in any of the 4 of these, the petri net is considered "not valid". The response will come in the form of a light blue notification box at the bottom right of the screen. The second button, with the refresh symbol, is used to reset the simulator. When this is clicked, the petri net will re-render and the initial marking (number of tokens at a given place) is restored. Now the behavior can be checked again until deadlock is reached. These features should assist in the development and evaluation of petri net designs. Try the buttons on one of the examples!

## Saving a Petri net

To save a project containing petri net designs, navigate above the toolbar and find the name of the branch (should be `master` for a new project). Click on branch name and then `"export branch"` at the bottom of the dropdown. The project will downloaded as a `.webgmex` file.

And that's it! Enjoy the process of designing petri nets with PeNDeS!

#### Sources

1. [Petri Net Applications](https://en.wikipedia.org/wiki/Petri_net#Workflow_nets)
2. [Free Choice Petri Nets](https://www7.in.tum.de/~esparza/fcbook-middle.pdf)

2. [Marked Graph](https://en.wikipedia.org/wiki/Marked_graph)

3. [Workflow Net](https://en.wikipedia.org/wiki/Petri_net#Workflow_nets)

   