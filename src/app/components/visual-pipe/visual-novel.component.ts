import {Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewEncapsulation} from '@angular/core';
import * as dagreD3 from 'dagre-d3';
import * as d3 from 'd3';
import {VisualNovelEdge, VisualNovelNode} from './visual-novel.model';

const VISUAL_NOVEL_ID = 'visual-novel';

@Component({
  selector: 'app-visual-novel',
  template: '<svg id="visual-novel"></svg>',
  styleUrls: ['./visual-novel.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class VisualNovelComponent implements OnChanges {

  @Input() nodes: VisualNovelNode[] = [];
  @Input() edges: VisualNovelEdge[] = [];
  @Input() trigger: string = '';
  @Input() selectable = true;
  @Input() multiSelect = false;
  @Output() nodeSelected = new EventEmitter();

  private svg: any;
  private graph: dagreD3.graphlib.Graph = null as any;
  private zoomObj: any;

  private static deselectAllComponents() {
    // @ts-ignore
    d3.selectAll('.selected').nodes().forEach((element: HTMLElement) => {
      element.classList.remove('selected');
    });
  }

  private static createNodeContent(node: VisualNovelNode): string {
    let html = `<div class="node-container ${node.id} row">`;
    html += `<div class="title" title="${node.sketch}">${node.sketch}</div>`;
    html += '</div>';
    return html;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.nodes && this.edges) {
      let transform;
      const group = document.getElementById(VISUAL_NOVEL_ID)?.getElementsByTagName('g');
      const transformGroup = group ? group[0] : null;
      if (transformGroup) {
        transform = transformGroup.getAttribute('transform');
      }
      this.cleanUpData();
      this.drawGraph();
      this.renderGraph();
      this.setSelectableNodes();
      this.initZoom(transform as any);
    }
  }

  zoom(ratio = 1) {
    const width = document.getElementById(VISUAL_NOVEL_ID)?.getBoundingClientRect().width;
    const height = document.getElementById(VISUAL_NOVEL_ID)?.getBoundingClientRect().height;
    let initialScale = ratio;
    if (width && height) {
      if (ratio === 0) {
        // @ts-ignore
        const widthScale = width / this.graph.graph().width;
        // @ts-ignore
        const heightScale = height / this.graph.graph().height;
        initialScale = (widthScale < heightScale ? widthScale : heightScale) * .9;
      }
      // @ts-ignore
      this.svg.call(this.zoomObj.transform, d3.zoomIdentity.translate((width - this.graph.graph().width * initialScale) / 2, 20
        // (height - this.graph.graph().height * initialScale) / 2 // middle horizontally
      ).scale(initialScale));
    }
  }

  selectNode(id: string) {
    if (this.selectable) {
      const d3Node = d3.selectAll('.' + id);
      const classes = d3Node.attr('class');
      if (classes.indexOf('selected') !== -1) {
        d3Node.attr('class', classes.replace('selected', '').trim());
      } else {
        if (!this.multiSelect) {
          VisualNovelComponent.deselectAllComponents();
        }
        d3Node.attr('class', classes + ' selected');
      }
    }
  }

  private drawGraph() {
    this.graph = new dagreD3.graphlib.Graph();
    this.graph.setGraph({nodesep: 70, ranksep: 50, rankdir: 'TB', marginx: 20, marginy: 20});
    this.nodes.forEach(node => this.graph.setNode(node.id, {label: node.id}));
    this.edges.forEach(edge => this.graph.setEdge(edge.sourceID, edge.targetID, {label: ''}));
    this.graph.nodes().forEach((v: any) => {
      const d3Node = this.graph.node(v);
      const node = this.nodes.find(n => n.id === v);
      d3Node.rx = d3Node.ry = 3; // corner radius of the nodes
      d3Node.label = VisualNovelComponent.createNodeContent(node as any);
      (d3Node as any).labelType = 'html';
      d3Node.class = encodeURI(v) + (this.selectable ? ' selectable' : '');
    });
  }

  private renderGraph() {
    d3.select('#visual-novel').selectAll('*').remove();
    this.svg = d3.select('#visual-novel');
    const inner = this.svg.append('g');

    this.svg.on('click', () => {
      VisualNovelComponent.deselectAllComponents();
      this.nodeSelected.emit();
    });

    this.zoomObj = d3.zoom().on('zoom', (event: any) => {
      inner.attr('transform', event.transform);
    });
    this.svg.call(this.zoomObj);
    const render = new dagreD3.render();
    render(inner, this.graph as any);
  }

  private setSelectableNodes() {
    const self = this; // eslint-disable-line
    d3.selectAll('.node').on('click', function (e: MouseEvent) {
      // @ts-ignore
      const classes = d3.select(this).attr('class');
      let deselect = false;
      if (self.selectable) {
        if (classes.indexOf('selected') !== -1) {
          // @ts-ignore
          d3.select(this).attr('class', classes.replace('selected', '').trim());
          deselect = true;
        } else {
          if (!self.multiSelect) {
            VisualNovelComponent.deselectAllComponents();
          }
          // @ts-ignore
          d3.select(this).attr('class', classes + ' selected');
        }
      }
      // @ts-ignore
      const id = d3.select(this).data()[0];
      self.nodeSelected.emit(deselect ? null : id);
      e.stopPropagation();
    });
  }

  private initZoom(transform?: string) {
    const container = document.getElementById(VISUAL_NOVEL_ID);
    if (container) {
      if (transform) {
        container.getElementsByTagName('g')[0]
          .setAttribute('transform', transform);
      } else {
        // Center the graph and set zoom
        // Set zoom according to different situations: zoom(0) / fit: many nodes, zoom(1) / 100%: just a few nodes.
        const width = container.getBoundingClientRect().width;
        const height = container.getBoundingClientRect().height;
        // @ts-ignore
        const widthScale = width / this.graph.graph().width;
        // @ts-ignore
        const heightScale = height / this.graph.graph().height;
        if (widthScale < (1 / 0.9) || heightScale < (1 / 0.9)) {
          this.zoom(0);
        } else {
          this.zoom(1);
        }
      }
    }
  }

  private cleanUpData() {
    const ids = this.nodes.map(node => node.id);
    this.edges = this.edges.filter(e => e.sourceID && e.targetID && e.sourceID !== e.targetID);
    this.edges = this.edges.filter(e => ids.some(id => e.sourceID === id) && ids.some(id => e.targetID === id));
  }
}
