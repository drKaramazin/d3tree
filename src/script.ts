/* tslint:disable:no-string-literal */
import * as d3 from 'd3';
import { ClusterLayout, HierarchyNode, TreeLayout } from 'd3-hierarchy';

export enum DIRECTION {
    TOP_BOTTOM = 'top-bottom',
    RIGHT_LEFT = 'right-left',
    BOTTOM_TOP = 'bottom-top',
    LEFT_RIGHT = 'left-right',
}

export enum TYPE {
    TREE = 'tree',
    CLUSTER = 'cluster',
}

export interface Unit {
    id?: number;
    name: string;
    level?: number;
}

export enum LINK_TYPE {
    LINES = 'lines',
    CURVES = 'curves',
}

export interface User {
    id: number;
    name: string;
    surname: string;
    second_name: string;
    mail: string;
    is_admin: boolean;
    active: boolean;
    avatar?: string;
    unit?: Unit;
    locality_id?: number;
    show_hints: boolean;
    forbid_files_download?: boolean;
}

export interface RevisionTreeData {
    created_by: User;
    executor: User;
    created_at: string;
    updated_at: string;
    copy_of: number;
}

interface RevisionTree {
    id: number;
    name: string;
    value?: RevisionTreeData;
    children?: RevisionTree[];
    x?: any;
    y?: any;
}

export class TreeDemo {

    private isInit = false;

    // private _data: RevisionTree;

    private root: HierarchyNode<RevisionTree>;

    readonly c = 15;

    readonly R = 10;

    width: number;
    readonly cw = 100;
    readonly height = 300;

    private layout: TreeLayout<RevisionTree> | ClusterLayout<RevisionTree>;

    private currentNode: any;

    private linkType = LINK_TYPE.CURVES;

    constructor(
        private _data: RevisionTree,
        private placement: HTMLElement,
        private canvasBox: HTMLElement,
        private _direction: DIRECTION = DIRECTION.BOTTOM_TOP,
    ) {
        // setTimeout(() => {
        this.width = this.canvasBox.clientWidth - this.cw;
        if (this.data) {
            this.initRoot();
            this.draw();
        }
        this.isInit = true;
        // }, 1000);
    }

    initRoot() {
        this.root = d3.hierarchy(this._data);
    }

    set data(data: RevisionTree) {
        this._data = data;
        if (this._data) {
            this.initRoot();
            if (this.isInit) {
                this.refresh();
            }
        }
    }
    get data(): RevisionTree {
        return this._data;
    }

    private _type: TYPE;
    set type(type: TYPE) {
        this._type = type;
        if (this.isInit) {
            this.refresh();
        }
    }
    get type(): TYPE {
        return this._type;
    }

    set direction(direction: DIRECTION) {
        this._direction = direction;
        if (this.isInit) {
            this.refresh();
        }
    }
    get direction(): DIRECTION {
        return this._direction;
    }

    private _currentRevisionId: number;
    set currentRevisionId(revisionId: number) {
        this._currentRevisionId = revisionId;
        if (this.root) {
            this.root.descendants().forEach((node) => {
                if (node.data.id === this._currentRevisionId) {
                    this.setCurrentRevision(node);
                    return true;
                }
            });
        }
    }

    showCaption(revision: RevisionTree) {
        d3.select(`#caption-group-${revision.id}`)
            .attr('style', '');
    }

    hideCaptions() {
        d3.select(this.placement)
            .select('g.nodes')
            .selectAll(`.caption-group`)
            .attr('style', (d: any) => {
                if (this.currentNode) {
                    if (d['data'].id !== this.currentNode.data.id) {
                        return 'display: none;';
                    }
                    return '';
                } else {
                    return 'display: none;';
                }
            });
    }

    prepareLayout(size: any, transform: string) {
        this.placement.setAttribute('transform', transform);
        if (this.type === TYPE.TREE) {
            this.layout = d3.tree().size(size) as TreeLayout<RevisionTree>;
            this.layout(this.root);
        } else {
            this.layout = d3.cluster().size(size) as ClusterLayout<RevisionTree>;
            this.layout(this.root);
        }
    }

    calculateCaptionOffsetX(dx: number): number {
        return dx + this.c + this.c / 3;
    }

    highlightPath(node: any, cl: string, showCaption: boolean = true) {
        this.root.path(node).forEach(item => {

            d3.select(`#node-${item.data.id}`)
                .classed(cl, true);
            d3.select(`#link-${item.data.id}`)
                .classed(cl, true);

            if (showCaption) {
                this.showCaption(item.data);
            }

        });
    }

    deselectPath(cl: string) {
        d3.select(this.placement)
            .select('g.nodes')
            .selectAll(`.revision-node.${cl}`)
            .classed(cl, false);
        d3.select(this.placement)
            .select('g.links')
            .selectAll(`.revision-link.${cl}`)
            .classed(cl, false);
        this.hideCaptions();
    }

    activatePath(node: any) {
        this.highlightPath(node, 'active');
    }

    deactivatePath() {
        this.deselectPath('active');
    }

    setCurrentRevision(node?: HierarchyNode<RevisionTree>) {
        if (node) {
            this.currentNode = node;
            // this.changeCurrentRevision.emit(node.data);
        } else {
            if (this._currentRevisionId) {
                this.currentRevisionId = this._currentRevisionId;
                return;
            }
        }

        d3.select(this.placement)
            .select('g.nodes')
            .select('.current-node')
            .classed('current-node', false)
            .attr('filter', '');

        this.deactivatePath();

        if (this.currentNode) {
            this.deselectPath('current');
            // this.activatePath(this.currentNode);
            this.highlightPath(this.currentNode, 'current', false);

            d3.select('#node-' + this.currentNode.data.id)
                .classed('current-node', true)
                .attr('filter', 'url(#currentNodeBlur)');

            d3.select(`#caption-group-${this.currentNode.data.id}`)
                .attr('style', '');

        }
    }

    drawCaptions(cl: any) {
        this.root.descendants().forEach((node) => {
            d3.select(this.placement)
                .select('g.nodes')
                .select(`#caption-group-${node.data.id}`)
                .append('text')
                .classed('revision-node-caption', true)
                .classed(cl, true)
                .attr('id', (d: any) => `caption-${d['data'].id}-${cl}`)
                .attr('x', (d: any) => this.calculateCaptionOffsetX(d['x']))
                .attr('y', (d: any) => d['y'] + this.c / 3)
                .attr('style', (d: any) => `width: ${this.width - this.calculateCaptionOffsetX(d['x'])}px; text-overflow: ellipsis; overflow: hidden;`)
                .attr('transform', (d: any) => {
                    switch (this.direction) {
                        case DIRECTION.TOP_BOTTOM:
                            return '';
                        case DIRECTION.RIGHT_LEFT:
                            return `rotate(-90, ${d['x']}, ${d['y']})`;
                        case DIRECTION.BOTTOM_TOP:
                            return `rotate(180, ${d['x']}, ${d['y']})`;
                        case DIRECTION.LEFT_RIGHT:
                            return `rotate(90, ${d['x']}, ${d['y']})`;
                    }
                })
                .text((d: any) => d['data'].name);
        });
    }

    draw() {
        switch (this.direction) {
            case DIRECTION.TOP_BOTTOM:
                this.prepareLayout([this.width, this.height - (this.c * 2)], `translate(0, ${this.c})`);
                break;
            case DIRECTION.RIGHT_LEFT:
                this.prepareLayout([this.height, this.width - (this.c * 2)], `translate(${this.width - this.c}, 0), rotate(90)`);
                break;
            case DIRECTION.BOTTOM_TOP:
                this.prepareLayout([this.width, this.height - (this.c * 2)], `translate(${this.width}, ${this.height - this.c}), rotate(180)`);
                break;
            case DIRECTION.LEFT_RIGHT:
                this.prepareLayout([this.height, this.width - (this.c * 2)], `translate(${this.c}, ${this.height}) rotate(-90)`);
                break;
        }

        // Nodes
        d3.select(this.placement)
            .select('g.nodes')
            .selectAll('.revision-node')
            .data(this.root.descendants())
            .enter()
            .append((d, i, node) => {
                if (d.data.value.copy_of) {
                    return d3.creator('svg:polygon').call(node[i]);
                } else {
                    return d3.creator('svg:circle').call(node[i]);
                }
            })
            .classed('revision-node', true)
            .attr('cx', (d: any) => d.data.value.copy_of ? null : d['x'])
            .attr('cy', (d: any) => d.data.value.copy_of ? null : d['y'])
            .attr('r', d => d.data.value.copy_of ? null : this.R)
            .attr('points',
                (d: any) => d.data.value.copy_of
                    ? `${d['x']}, ${d['y'] - this.R} ${d['x'] + this.R},${d['y']} ${d['x']},${d['y'] + this.R} ${d['x'] - this.R},${d['y']}` : null)
            .attr('id', d => 'node-' + d.data.id)
            .on('mouseover', d => this.activatePath(d))
            .on('mouseout', () => this.deactivatePath())
            .on('click', d => this.setCurrentRevision(d));

        d3.select(this.placement)
            .select('g.nodes')
            .selectAll(`caption-group`)
            .data(this.root.descendants())
            .enter()
            .append('g')
            .attr('id', d => `caption-group-${d.data.id}`)
            .attr('style', 'display: none;')
            .classed('caption-group', true);

        this.drawCaptions('white');
        this.drawCaptions('black');

        // Links
        if (this.linkType === LINK_TYPE.CURVES) {
            d3.select(this.placement)
                .select('g.links')
                .selectAll('path')
                .data(this.root.links())
                .enter()
                .append('path')
                .classed('revision-link', true)
                .attr('id', d => 'link-' + d.target.data.id)
                .attr('d', <any>d3.linkVertical()
                    .x((d: any) => d['x'])
                    .y((d: any) => d['y'])
                );
        } else {
            d3.select(this.placement)
                .select('g.links')
                .selectAll('line')
                .data(this.root.links())
                .enter()
                .append('line')
                .classed('revision-link', true)
                .attr('id', (d: any) => 'link-' + d.target.data.id)
                .attr('x1', (d: any) => d.source['x'])
                .attr('y1', (d: any) => d.source['y'])
                .attr('x2', (d: any) => d.target['x'])
                .attr('y2', (d: any) => d.target['y']);
        }

        this.setCurrentRevision();
    }

    clear() {
        // Nodes
        d3.select(this.placement)
            .select('g.nodes')
            .selectAll('circle.revision-node')
            .remove();

        d3.select(this.placement)
            .select('g.nodes')
            .selectAll('.caption-group')
            .remove();

        // Links
        d3.select(this.placement)
            .select('g.links')
            .selectAll('path')
            .remove();

        d3.select(this.placement)
            .select('g.links')
            .selectAll('line')
            .remove();
    }

    refresh() {
        this.clear();
        this.draw();
    }

}
