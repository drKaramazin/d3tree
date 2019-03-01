const data = {
    "name": "Source task",
    "type": "circle",
    "children": [
        {
            "name": "Task rev B1",
            "type": "cubic",
            "children": [
                {
                    "name": "Task rev C1",
                    "type": "circle",
                    "value": 100,
                    "children": [
                        {
                            "name": "Task rev D1",
                            "type": "circle",
                            "value": 100
                        },
                        {
                            "name": "Task rev D2",
                            "type": "circle",
                            "value": 300
                        },
                        {
                            "name": "Task rev D3",
                            "type": "circle",
                            "value": 200
                        }
                    ]
                },
                {
                    "name": "Task rev C2",
                    "type": "circle",
                    "value": 300
                },
                {
                    "name": "Task rev C3",
                    "type": "circle",
                    "value": 200
                }
            ]
        },
        {
            "name": "Task rev B2",
            "type": "circle",
            "value": 200
        }
    ]
};

const root = d3.hierarchy(data);

let direction = 'top-bottom';
let type = 'tree';

let treeLayout;
let clusterLayout;

const linkGroups = d3.select('svg g.links');

width = 400;
height = 200;
c = 7;

prepareLayout = (size, transform) => {
    const layout = document.getElementById('layout');
    layout.setAttribute('transform', transform);
    if (type === 'tree') {
        treeLayout = d3.tree().size(size);
        treeLayout(root);
    } else {
        clusterLayout = d3.cluster().size(size);
        clusterLayout(root);
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
        .attr('x', (d) => d.x + c * 2)
        .attr('y', (d) => d.y + c/2)
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

draw = () => {
    const treeType = document.getElementById('treeType');
    type = treeType.options[treeType.selectedIndex].value;

    const tranformDirection = document.getElementById('tranformDirection');
    direction = tranformDirection.options[tranformDirection.selectedIndex].value;
    switch(direction) {
        case 'top-bottom':
            prepareLayout([width, height - c*2], `translate(0, ${c})`);
            break;
        case 'right-left':
            prepareLayout([height, width - c*2], `translate(${width - c}, 0), rotate(90)`);
            break;
        case 'bottom-top':
            prepareLayout([width, height - c*2], `translate(${width}, ${height - c}), rotate(180)`);
            break;
        case 'left-right':
            prepareLayout([height, width - c*2], `translate(${c}, ${height}) rotate(-90)`);
            break;
    }

    // Nodes
    d3.select('svg g.nodes')
        .selectAll('circle.node')
        .data(root.descendants())
        .enter()
        .append('circle')
        .classed('node', true)
        .attr('cx', (d) => d.x)
        .attr('cy', (d) => d.y)
        .attr('r', 6)
        .attr('id', (d, i) => d.data.id = 'node' + i)
        .on('mouseover', (d) => {
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
                .selectAll('circle.node.active')
                .classed('active', false);
            linkGroups.selectAll('.link.active')
                .classed('active', false);
            d3.select('svg g.nodes')
                .selectAll('text.node-caption')
                .attr('style', 'display: none;');
        });

    drawCaptions('white');
    drawCaptions('black');

    // Links
    linkTypeE = document.getElementById('linksType');
    linkType = linkTypeE.options[linkTypeE.selectedIndex].value;

    if (linkType === "curves") {
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

clear = () => {
    // Nodes
    d3.select('svg g.nodes')
        .selectAll('circle.node')
        .remove();

    d3.select('svg g.nodes')
        .selectAll('text.node-caption')
        .remove();

    // Links
    d3.select('svg g.links')
        .selectAll('path')
        .remove();

    d3.select('svg g.links')
        .selectAll('line')
        .remove();
};

refresh = () => {
    clear();
    draw();
};

init = () => {
    draw();
};

window.onload = init;