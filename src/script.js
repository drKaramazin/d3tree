const TYPE = {
    CUBIC: 'cubic',
    CIRCLE: 'circle',
};

const data = {
    "name": "Source task",
    "type": TYPE.CIRCLE,
    "children": [
        {
            "name": "Task rev B1",
            "type": TYPE.CUBIC,
            "children": [
                {
                    "name": "Task rev C1",
                    "type": TYPE.CIRCLE,
                    "value": 100,
                    "children": [
                        {
                            "name": "Task rev D1",
                            "type": TYPE.CIRCLE,
                            "value": 100
                        },
                        {
                            "name": "Task rev D2",
                            "type": TYPE.CIRCLE,
                            "value": 300
                        },
                        {
                            "name": "Task rev D3",
                            "type": TYPE.CUBIC,
                            "value": 200
                        }
                    ]
                },
                {
                    "name": "Task rev C2",
                    "type": TYPE.CIRCLE,
                    "value": 300
                },
                {
                    "name": "Task rev C3",
                    "type": TYPE.CIRCLE,
                    "value": 200
                }
            ]
        },
        {
            "name": "Task rev B2",
            "type": TYPE.CIRCLE,
            "value": 200
        }
    ]
};

const root = d3.hierarchy(data);

let direction = 'top-bottom';
let type = 'tree';

let treeLayout;
let clusterLayout;

let linkGroups;

width = 400;
height = 300;
const C = 10;

const R = 10;

prepareLayout = (size, transform, isTransition) => {
    if (!isTransition) {
        const layout = document.getElementById('layout');
        layout.setAttribute('transform', transform);
    } else {
        d3.select('#layout')
            .transition()
            .duration(1000)
            .attr('transform', transform);
    }

    if (type === 'tree') {
        treeLayout = d3.tree().size(size);
        treeLayout(root);
    } else {
        clusterLayout = d3.cluster().size(size);
        clusterLayout(root);
    }
};

prepareCanvas = (isTransition) => {
    const treeType = document.getElementById('treeType');
    type = treeType.options[treeType.selectedIndex].value;

    const tranformDirection = document.getElementById('tranformDirection');
    direction = tranformDirection.options[tranformDirection.selectedIndex].value;
    switch(direction) {
        case 'top-bottom':
            prepareLayout([width, height - C*2], `translate(0, ${C})`, isTransition);
            break;
        case 'right-left':
            prepareLayout([height, width - C*2], `translate(${width - C}, 0), rotate(90)`, isTransition);
            break;
        case 'bottom-top':
            prepareLayout([width, height - C*2], `translate(${width}, ${height - C}), rotate(180)`, isTransition);
            break;
        case 'left-right':
            prepareLayout([height, width - C*2], `translate(${C}, ${height}) rotate(-90)`, isTransition);
            break;
    }
};

drawCaptions = (cl) => {
    d3.select('svg g.nodes')
        .selectAll(`text.node-caption.${cl}`)
        .data(root.descendants())
        .enter()
        .append('text')
        .classed('node-caption', true)
        .classed(cl, true)
        .attr('style', 'display: none;')
        .attr('id', d => d.data.id + '-caption-' + cl)
        .attr('x', (d) => d.x + C * 2)
        .attr('y', (d) => d.y + C/2)
        .attr('transform', (d) => {
            switch (direction) {
                case 'top-bottom':
                    return '';
                case 'right-left':
                    return `rotate(-90, ${d.x}, ${d.y})`;
                case 'bottom-top':
                    return `rotate(180, ${d.x}, ${d.y})`;
                case 'left-right':
                    return `rotate(90, ${d.x}, ${d.y})`;
            }
        })
        .text((d) => d.data.name);
};

getCurrentLinkType = () => {
    const linkTypeE = document.getElementById('linksType');
    return linkType = linkTypeE.options[linkTypeE.selectedIndex].value;
};

drawLinks = () => {
    if (getCurrentLinkType() === "curves") {
        linkGroups.selectAll('path')
            .data(root.links())
            .enter()
            .append('path')
            .classed('link', true)
            .attr('id', d => d.target.data.id + '-link')
            .attr('d', d3.linkVertical()
                .x(d => d.x)
                .y(d => d.y)
            );
    } else {
        linkGroups.selectAll('line')
            .data(root.links())
            .enter()
            .append('line')
            .classed('link', true)
            .attr('id', d => d.target.data.id + '-link')
            .attr('x1', d => d.source.x)
            .attr('y1', d => d.source.y)
            .attr('x2', d => d.target.x)
            .attr('y2', d => d.target.y);
    }
};

transitionLinks = () => {
    if (getCurrentLinkType() === "curves") {
        linkGroups.selectAll('path')
            .data(root.links())
            .transition()
            .duration(1000)
            .attr('d', d3.linkVertical()
                .x(d => d.x)
                .y(d => d.y)
            );
    } else {
        linkGroups.selectAll('line')
            .data(root.links())
            .transition()
            .duration(1000)
            .attr('id', d => d.target.data.id + '-link')
            .attr('x1', d => d.source.x)
            .attr('y1', d => d.source.y)
            .attr('x2', d => d.target.x)
            .attr('y2', d => d.target.y);
    }
};

transitionNodes = () => {
    d3.select('svg g.nodes')
        .selectAll('.node')
        .data(root.descendants())
        .transition()
        .duration(1000)
        .attr('points', d => calcPoints(d))
        .attr('cx', d => calcCx(d))
        .attr('cy', d => calcCy(d));
};

calcPoints = d => d.data.type === TYPE.CUBIC ? `${d.x}, ${d.y - R} ${d.x + R},${d.y} ${d.x},${d.y + R} ${d.x - R},${d.y}`: null;
calcCx = d => d.data.type === TYPE.CIRCLE ? d.x : null;
calcCy = d => d.data.type === TYPE.CIRCLE ? d.y : null;

draw = () => {
    prepareCanvas();

    // Nodes
    d3.select('svg g.nodes')
        .selectAll('.node')
        .data(root.descendants())
        .enter()
        .append((d, i, node) => {
            if (d.data.type === TYPE.CUBIC) {
                return d3.creator('svg:polygon').call(node[i]);
            } else {
                return d3.creator('svg:circle').call(node[i]);
            }
        })
        .classed('node', true)
        .attr('points', d => calcPoints(d))
        .attr('cx', d => calcCx(d))
        .attr('cy', d => calcCy(d))
        .attr('r', (d) => d.data.type === TYPE.CIRCLE ? R : null)
        .attr('id', (d, i) => d.data.id = 'node' + i)
        .on('mouseover', d => {
            root.path(d).forEach(item => {
                d3.select('#' + item.data.id)
                    .classed('active', true);
                d3.select('#' + item.data.id + '-link')
                    .classed('active', true);
                d3.select('#' + item.data.id + '-caption-black')
                    .attr('style', '');
                d3.select('#' + item.data.id + '-caption-white')
                    .attr('style', '');
            });
        })
        .on('mouseout', () => {
            d3.select('svg g.nodes')
                .selectAll('.node.active')
                .classed('active', false);
            linkGroups.selectAll('.link.active')
                .classed('active', false);
            d3.select('svg g.nodes')
                .selectAll('text.node-caption')
                .attr('style', 'display: none;');
        });

    drawCaptions('white');
    drawCaptions('black');

    drawLinks();
};

changeTransform = () => {
    clearCaptions();

    prepareCanvas(true);

    transitionLinks();
    transitionNodes();

    drawCaptions('white');
    drawCaptions('black');

    drawLinks();
};

changeType = () => {
    clearCaptions();

    prepareCanvas();

    transitionLinks();
    transitionNodes();

    drawCaptions('white');
    drawCaptions('black');

    drawLinks();
};

clearLinks = () => {
    d3.select('svg g.links')
        .selectAll('path')
        .remove();

    d3.select('svg g.links')
        .selectAll('line')
        .remove();
};

clearCaptions = () => {
    d3.select('svg g.nodes')
        .selectAll('text.node-caption')
        .remove();
};

clear = () => {
    // Nodes: Circles
    d3.select('svg g.nodes')
        .selectAll('circle.node')
        .remove();

    // Nodes: Polygons
    d3.select('svg g.nodes')
        .selectAll('polygon.node')
        .remove();

    clearCaptions();
    clearLinks();
};

refresh = () => {
    clear();
    draw();
};

init = () => {
    linkGroups = d3.select('svg g.links');
    draw();
};

window.onload = init;
