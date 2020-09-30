import * as d3 from 'd3';
import { ClusterLayout, HierarchyNode, TreeLayout } from 'd3-hierarchy';

import { Direction, LinkType, RevisionTreeModel, Type } from '@models/revisions/revision-tree-model';

export class RevisionsTree {

  readonly R = 10;
  readonly cw = 100;
  readonly c = 15;

  private placement: HTMLElement;
  private layout: TreeLayout<RevisionTreeModel> | ClusterLayout<RevisionTreeModel>;
  private root: HierarchyNode<RevisionTreeModel>;

  protected currentNode: any;
  protected currentRevisionId: number;

  protected width: number;
  protected height: number;

  protected appeared = false;

  constructor(
    protected canvas: HTMLElement,
    protected data: RevisionTreeModel,
    protected direction: Direction,
    protected type: Type,
    protected linkType: LinkType,
  ) {
    this.width = this.canvas.clientWidth - this.cw;
    this.height = this.canvas.clientHeight;

    this.placement = this.canvas.querySelector('#layout');
    this.root = d3.hierarchy(this.data);
  }

  getAppeared(): boolean {
    return this.appeared;
  }

  setCurrentRevisionId(revisionId: number): boolean {
    this.currentRevisionId = revisionId;
    if (this.root) {
      this.root.descendants().forEach((node) => {
        if (node.data.id === this.currentRevisionId) {
          return this.setCurrentRevision(node);
        }
      });
    }

    return false;
  }

  setType(type: Type) {
    this.type = type;
    if (this.appeared) {
      this.refresh();
    }
  }

  setDirection(direction: Direction) {
    this.direction = direction;
    if (this.appeared) {
      this.refresh();
    }
  }

  setLinkType(linkType: LinkType) {
    this.linkType = linkType;
    if (this.appeared) {
      this.refresh();
    }
  }

  private setCurrentRevision(node?: HierarchyNode<RevisionTreeModel>): boolean {
    if (node) {
      this.currentNode = node;
    } else {
      return false;
    }

    if (this.appeared) {
      d3.select(this.placement)
        .select('g.nodes')
        .select('.current-node')
        .classed('current-node', false)
        .attr('filter', '');

      this.deactivatePath();

      this.deselectPath('current');
      this.highlightPath(this.currentNode, 'current', false);

      d3.select('#node-' + this.currentNode.data.id)
        .classed('current-node', true)
        .attr('filter', 'url(#currentNodeBlur)');

      d3.select(`#caption-group-${this.currentNode.data.id}`)
        .attr('style', '');
    }

    return true;
  }

  private prepareLayout(size, transform) {
    this.placement.setAttribute('transform', transform);
    if (this.type === Type.TREE) {
      this.layout = d3.tree().size(size) as TreeLayout<RevisionTreeModel>;
      this.layout(this.root);
    } else {
      this.layout = d3.cluster().size(size) as ClusterLayout<RevisionTreeModel>;
      this.layout(this.root);
    }
  }

  private calculateCaptionOffsetX(dx: number): number {
    return dx + this.c + this.c / 3;
  }

  private drawCaptions(cl) {
    this.root.descendants().forEach((node) => {
      d3.select(this.placement)
        .select('g.nodes')
        .select(`#caption-group-${node.data.id}`)
        .append('text')
        .classed('revision-node-caption', true)
        .classed(cl, true)
        .attr('id', d => `caption-${d['data'].id}-${cl}`)
        .attr('x', d => this.calculateCaptionOffsetX(d['x']))
        .attr('y', d => d['y'] + this.c / 3)
        .attr('style', d => `width: ${this.width - this.calculateCaptionOffsetX(d['x'])}px; text-overflow: ellipsis; overflow: hidden;`)
        .attr('transform', (d) => {
          switch (this.direction) {
            case Direction.TOP_BOTTOM:
              return '';
            case Direction.RIGHT_LEFT:
              return `rotate(-90, ${d['x']}, ${d['y']})`;
            case Direction.BOTTOM_TOP:
              return `rotate(180, ${d['x']}, ${d['y']})`;
            case Direction.LEFT_RIGHT:
              return `rotate(90, ${d['x']}, ${d['y']})`;
          }
        })
        .text((d) => d['data'].name);
    });
  }

  private showCaption(revision: RevisionTreeModel) {
    d3.select(`#caption-group-${revision.id}`)
      .attr('style', '');
  }

  private hideCaptions() {
    d3.select(this.placement)
      .select('g.nodes')
      .selectAll(`.caption-group`)
      .attr('style', (d) => {
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

  private highlightPath(node: any, cl: string, showCaption: boolean = true) {
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

  private deselectPath(cl: string) {
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

  private activatePath(node: any) {
    this.highlightPath(node, 'active');
  }

  private deactivatePath() {
    this.deselectPath('active');
  }

  draw() {
    if (!this.appeared) {
      switch (this.direction) {
        case Direction.TOP_BOTTOM:
          this.prepareLayout([this.width, this.height - (this.c * 2)], `translate(0, ${this.c})`);
          break;
        case Direction.RIGHT_LEFT:
          this.prepareLayout([this.height, this.width - (this.c * 2)], `translate(${this.width - this.c}, 0), rotate(90)`);
          break;
        case Direction.BOTTOM_TOP:
          this.prepareLayout([this.width, this.height - (this.c * 2)], `translate(${this.width}, ${this.height - this.c}), rotate(180)`);
          break;
        case Direction.LEFT_RIGHT:
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
        .attr('cx', d => d.data.value.copy_of ? null : d['x'])
        .attr('cy', d => d.data.value.copy_of ? null : d['y'])
        .attr('r', d => d.data.value.copy_of ? null : this.R)
        .attr('points',
          d => d.data.value.copy_of
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
      if (this.linkType === LinkType.CURVES) {
        d3.select(this.placement)
          .select('g.links')
          .selectAll('path')
          .data(this.root.links())
          .enter()
          .append('path')
          .classed('revision-link', true)
          .attr('id', d => 'link-' + d.target.data.id)
          .attr('d', <any>d3.linkVertical()
            .x(d => d['x'])
            .y(d => d['y'])
          );
      } else {
        d3.select(this.placement)
          .select('g.links')
          .selectAll('line')
          .data(this.root.links())
          .enter()
          .append('line')
          .classed('revision-link', true)
          .attr('id', d => 'link-' + d.target.data.id)
          .attr('x1', d => d.source['x'])
          .attr('y1', d => d.source['y'])
          .attr('x2', d => d.target['x'])
          .attr('y2', d => d.target['y']);
      }

      this.appeared = true;
      this.setCurrentRevisionId(this.currentRevisionId);
    }
  }

  clear() {
    if (this.appeared) {
      // Nodes
      d3.select(this.placement)
        .select('g.nodes')
        .selectAll('.revision-node')
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

      this.appeared = false;
    }
  }

  refresh() {
    this.clear();
    this.draw();
  }

}
