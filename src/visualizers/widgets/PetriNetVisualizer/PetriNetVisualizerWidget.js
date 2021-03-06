/*globals define, WebGMEGlobal*/

/**
 * Generated by VisualizerGenerator 1.7.0 from webgme on Fri Nov 13 2020 19:12:59 GMT-0600 (Central Standard Time).
 */

define(['jointjs', 'dagrejs', 'graphlibjs', 'css!./styles/PetriNetVisualizerWidget.css', 'css!jointjscss'], function (jointjs, dagrejs, graphlibjs) {
    
        'use strict';

        var WIDGET_CLASS = 'petri-net-visualizer';

        // default widget 
        function PetriNetVisualizerWidget(logger, container) {
            this._logger = logger.fork('Widget');
            this._el = container;
            this.nodes = [];
            this._initialize();
            this._logger.debug("widget ctor finished");
        }

        PetriNetVisualizerWidget.prototype._initialize = function () {
            var width = this._el.width(),
                height = this._el.height(),
                self = this;
            this._el.addClass(WIDGET_CLASS);
            this._graph = new jointjs.dia.Graph();
            this._paper = new jointjs.dia.Paper({
                el: $(this._el),
                width: width,
                height: height,
                gridSize: 10,
                defaultAnchor: { name: 'perpendicular'},
                defaultConnectionPoint: { name: 'boundary'},
                model: this._graph
            });
            this._paper.setInteractivity(false);
            this._paper.removeTools();

            var graph = this._graph;
            var paper = this._paper;

            this.initNetwork();

            function getPlaces(transition, direction) {
                // 0 is in outplaces, 1 is inplaces
                if (direction) {
                    // inplaces
                    var links = graph.getConnectedLinks(transition, {inbound: true});
                } else {
                    var links = graph.getConnectedLinks(transition, {outbound: true});
                }
                var elts = graph.getElements();
                var places = [];
                for (var j = 0; j < links.length; j++) {
                    for (var k = 0; k < elts.length; k++){
                        if (direction) {
                            // source is coming from place to transition
                            if (links[j].attributes.source.id === elts[k].id) {
                                places.push(elts[k]);
                            }
                        } else {
                            // target is going from transition to place
                            if (links[j].attributes.target.id === elts[k].id) {
                                places.push(elts[k]);
                            }
                        }
                    }
                }
                return places;
            }

            function isTransition(element) {
                return element.attributes.type === "pn.Transition";
            }

            function isEnabledTransition(transition) {
                var inplaces = getPlaces(transition, 1);
                if (inplaces.length === 0){
                    return false;
                }

                for (var i = 0; i < inplaces.length; i+=1) {
                    if (inplaces[i].attributes.attrs.label.text <= 0) {
                        return false;
                    }
                }
                return true;
            }

            function getEnabledTransitions(callback) {
                var elts = graph.getElements();
                var enabled = [];
                for (var i = 0; i < elts.length; i++){
                    if (isTransition(elts[i]) && isEnabledTransition(elts[i])) {
                        enabled.push(elts[i]);
                    }
                }
                 callback(enabled);
            }

            function getUnenabledTransitions(callback) {
                var elts = graph.getElements();
                var unenabled = [];
                for (var i = 0; i < elts.length; i++){
                    if (isTransition(elts[i]) && !isEnabledTransition(elts[i])) {
                        unenabled.push(elts[i]);
                    }
                }
                 callback(unenabled);
            }

            function fireEnabledTransition(transition, callback) {
                var inbound = graph.getConnectedLinks(transition, { inbound: true });
                var outbound = graph.getConnectedLinks(transition, { outbound: true });

                var srcs = inbound.map(function(link) {
                    return link.getSourceElement();
                });

                var dsts = outbound.map(function(link) {
                    return link.getTargetElement();
                });

                srcs.forEach(function(s) {
                        
                    var links = inbound.filter(function(l) {
                        return l.getSourceElement() === s;
                    }); 

                    // update count before sending token to prevent spamming
                    links.forEach(function(l) {
                        var inTokens = s.attributes.attrs.label.text;
                        s.attr('label/text', inTokens - 1);
                        l.findView(paper).sendToken(jointjs.V('circle', {r: 5, fill: '#feb662'}), 400, function() {
                            
                        });
                    });
                });

                dsts.forEach(function(d) {

                    var links = outbound.filter(function(l) {
                        return l.getTargetElement() === d;
                    });

                    links.forEach(function(l) {
                        l.findView(paper).sendToken(jointjs.V('circle', {r: 5, fill: '#feb662'}), 400, function() {
                            var outTokens = d.attributes.attrs.label.text;
                            d.attr('label/text', outTokens + 1);
                        });
                    });
                });

                callback(transition);
            }

            function updateHighlights() {
                getEnabledTransitions(function(t) {
                    t.forEach(function(t) {
                        var v = paper.findViewByModel(t);
                        v.highlight();
                    });    
                });
                getUnenabledTransitions(function(t) {
                    t.forEach(function(t) {
                        var v = paper.findViewByModel(t);
                        v.unhighlight();
                    });    
                });
            } 

            function inDeadlock() {
                var len = null;
                var l = getEnabledTransitions(function(t) {
                        len = t.length;
                    });
                return len === 0;
            }

            function prompt() {
                window.alert("click an enabled transition (highlighted)");
                getEnabledTransitions(function(t) {
                    t.forEach(function(t) {
                        var v = paper.findViewByModel(t);
                        v.highlight();
                    });    
                });
            }

                // track of fireable transitions; don't let user interact with deadlocked petrinet
                paper.on('blank:mouseover', function() {
                    updateHighlights();
                    if (inDeadlock()) {
                        alert("Deadlock! Reset the simulator in the toolbar \n  <------");
                    }
                });

                paper.on('element:pointerdown', function(elementView) {
                    var element = elementView.model;
                    if (!inDeadlock()) { 
                        if (element.attributes.type === "pn.Transition") {
                            if (isEnabledTransition(element)){
                                fireEnabledTransition(element, updateHighlights);
                            } else {
                                prompt();
                            }
                        } else {
                            prompt();
                        }
                    }
                });
            
            this._place = jointjs.dia.Element.define('network.Place', {
            attrs: {
                circle: {
                    r: 25,
                    'stroke-width': 3,
                    stroke: '#000000',
                    fill: '#aabbaa',
                    cursor: 'pointer'
                },
                text: {
                    'font-weight': '800',
                    'text-anchor': 'middle',
                    'ref-x': .5, 
                    'ref-y': -20,
                    'ref': 'circle',
                    cursor: 'pointer'
                },
                label: {
                    'font-weight': '400',
                    'text-anchor': 'middle',
                    'ref-y': 20,
                    'ref': 'circle',
                    cursor: 'pointer' 
                }   
            }
        }, {
            markup: [{
                    tagName: 'circle',
                    selector: 'circle'
                }, {
                    tagName: 'text',
                    selector: 'text'
                }, {
                    tagName: 'text',
                    selector: 'label'
                }]
        });
           this._logger.debug("widget initialize done");
        };

        function makeTransition(text, x, y) {
            var pn = jointjs.shapes.pn;
            return new pn.Transition({
            position: {x: x, y: y}, 
            attrs: {
                body: {
                    refWidth: '100%',
                    refHeight: '100%',
                    strokeWidth: 3,
                    stroke: '#000000',
                    fill: '#FFFFFF'
                },
                '.label': {
                    'text': text,
                    'fill': '#fe854f'
                },
                '.root': {
                    'fill': '#9586fd',
                    'stroke': '#9586fd'
                }
            }
        });
        }

        function addLink(src, dst) {
            console.log("src", src);
            console.log("dst", dst);
            var pn = jointjs.shapes.pn;

            if (src !== null & dst !== null) {
                return new pn.Link({

                    source: {id: src.id, selector: '.root'},
                    target: {id: dst.id, selector: '.root'},
                    attrs: {
                        '.connection': {
                            'fill':'none',
                            'stoke-linejoin':'round',
                            'stroke-width': '2',
                            'stroke': '#4b4a67'
                        }
                    }
                });
            } else {
                console.log("src/dst pair is not valid! (one or both are null)");
            }
        }

        PetriNetVisualizerWidget.prototype.onWidgetContainerResize = function (width, height) {
            this._logger.debug('Widget is resizing...');
            if(this._paper){
                this._paper.setDimensions(width, height);
                this._paper.scaleContentToFit();
            }
        };

        PetriNetVisualizerWidget.prototype.addNode = function (desc) {
            if (desc) {
               console.log("node id: " + desc.id + " node type: " + desc.type + " node name: " + desc.name + " # children: " + desc.childrenIds.length + " parent: " + desc.parentId + " is arc: " + desc.isConnection);
               this.nodes.push(desc);
            };
        };

        PetriNetVisualizerWidget.prototype.initNetwork = function() {
            this._logger.debug("making network...");

            // id: nodepath
            // name: node name
            // childrenIds: length is number of tokens
            // parentId: parent path
            // isConnection: true or false is arc
            // type: metaType - place, transition, or arc
            // src: src path of arc
            // dst: dst path of arc

            // build the network add the places and transitions first
            var places = [];
            var transitions = [];
            var arcs = [];
            var nameToId = {};
            var xp = 50; 
            var yp = 300;
            var xt = 50;
            var yt = 500;
            for (var i = 0; i < this.nodes.length; i+=1) {
                var node = this.nodes[i];
                if (node.type === "Place")
                {
                    // keep going
                    if (xp < 600) {
                        xp += 120;
                    } else {
                        // next row
                        yp -= 120;
                        xp = 150;
                    }

                    var place = new this._place({
                            position: {x: xp, y: yp},
                            attrs: {
                                text: {
                                    text: node.name
                                },
                                label: {
                                    text: node.childrenIds.length
                                }
                            }
                    });

                    places.push(place);
                    var nodeName = node.name;
                    nameToId[nodeName] = node.id;

                } else if (node.type === "Transition") {

                    // keep going
                    if (xt < 400) {
                        xt += 120;
                    } else {
                        yt += 150
                        xt = 150
                    }

                    transitions.push(makeTransition(node.name, xt, yt));
                    var transitionName = node.name;
                    nameToId[transitionName] = node.id;
                }
            } // done adding places and transitions

            for (var i = 0; i < this.nodes.length; i+=1) {
                var node = this.nodes[i];
                if (node.type === "P2T") {
                    // resolve src and dst of the arc 
                    // use src and dst to look up
                    // 1. find src in places
                    var srcP = null;
                    for (var j = 0; j < places.length; j+=1) {
                        var place = places[j];
                        var placeName = place.attributes.attrs.text.text; // name of place
                        if (node.src === nameToId[placeName]) {
                            // this means the place with the src path of the current node is found
                            var srcP = place;
                            break; // done checking
                        }
                    }
                    var dstT = null;
                    for (var k = 0; k < transitions.length; k+=1) {
                        var transition = transitions[k];
                        var transitionName = transition.attributes.attrs[".label"].text;
                        if(node.dst === nameToId[transitionName]) {
                            var dstT = transition;
                            break; // done checking
                        }
                    }

                    // add the P2T arc
                    if (srcP !== null && dstT !== null) {
                        arcs.push(addLink(srcP, dstT));
                    } else {
                        console.log("one (or both) P2T arc endpoint(s) is(are) null!")
                    }

                // other kind of arc
                } else if (node.type === "T2P") {
                    var srcT = null;
                    for (var l = 0; l < transitions.length; l+=1) {
                        var transition2 = transitions[l];
                        var transitionName2 = transition2.attributes.attrs[".label"].text; // name of transition
                        if(node.src === nameToId[transitionName2]) {
                            var srcT = transition2;
                            break;
                        }
                    }

                    var dstP = null;
                    for (var m = 0; m < places.length; m+=1) {
                        var place2 = places[m];
                        var placeName2 = place2.attributes.attrs.text.text; // name of place
                        if (node.dst === nameToId[placeName2]) {
                            // this means the place with the src path of the current node is found
                            var dstP = place2;
                            break;
                        }
                    }

                    // add the T2P arc
                    if (srcT !== null && dstP !== null) {
                        arcs.push(addLink(srcT, dstP));
                    } else {
                        console.log("one (or both) T2P arc endpoint(s) is(are) null!")
                    }
                }
            }

            // make network
            for (var n = 0; n < places.length; n+=1) {
                this._graph.addCell(places[n]);
            }
            for (var o = 0; o < transitions.length; o+=1) {
                this._graph.addCell(transitions[o]);
            }
            for (var p = 0; p < arcs.length; p+=1) {
                console.log("adding arc");
                this._graph.addCell(arcs[p]);
            }

        };

        /* * * * * * * * Visualizer life cycle callbacks * * * * * * * */
        PetriNetVisualizerWidget.prototype.destroy = function () {
        };

        PetriNetVisualizerWidget.prototype.onActivate = function () {
            this._logger.debug('PetriNetVisualizerWidget has been activated');
        };

        PetriNetVisualizerWidget.prototype.onDeactivate = function () {
            this._logger.debug('PetriNetVisualizerWidget has been deactivated');
        };

    return PetriNetVisualizerWidget;
});
