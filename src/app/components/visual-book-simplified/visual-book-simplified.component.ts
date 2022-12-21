import {Component, Inject, OnInit, ViewEncapsulation} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import * as dagreD3 from 'dagre-d3';
import * as d3 from 'd3';
import {VisualEdge, VisualModel, VisualNode} from '../../model/visual-book.model';

const VISUAL_BOOK_ID = 'visual-book-simplified';

@Component({
  selector: 'app-visual-book-simplified',
  templateUrl: './visual-book-simplified.component.html',
  styleUrls: ['./visual-book-simplified.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class VisualBookSimplifiedComponent implements OnInit {
  private nodes: VisualNode[] = [];
  private edges: VisualEdge[] = [];
  private svg: any;
  private graph: dagreD3.graphlib.Graph = null as any;
  private zoomObj: any;

  constructor(private dialogRef: MatDialogRef<VisualBookSimplifiedComponent>,
              @Inject(MAT_DIALOG_DATA) public data: { model: VisualModel }) {
    this.nodes = data.model.nodes;
    this.edges = data.model.edges;
  }

  close() {
    this.dialogRef.close();
  }

  ngOnInit() {
    if (this.nodes && this.nodes.length) {
      let transform;
      const group = document.getElementById(VISUAL_BOOK_ID)?.getElementsByTagName('g');
      const transformGroup = group ? group[0] : null;
      if (transformGroup) {
        transform = transformGroup.getAttribute('transform');
      }
      this.cleanUpData();
      this.drawGraph();
      this.renderGraph();;
      this.initZoom(transform as any);
    } else {
      this.cleanUpData();
      this.drawGraph();
      this.renderGraph();
    }
  }

  zoom(ratio = 1) {
    const width = document.getElementById(VISUAL_BOOK_ID)?.getBoundingClientRect().width;
    const height = document.getElementById(VISUAL_BOOK_ID)?.getBoundingClientRect().height;
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
      ).scale(initialScale));
    }
  }

  private drawGraph() {
    this.graph = new dagreD3.graphlib.Graph();
    this.graph.setGraph({nodesep: 70, ranksep: 50, rankdir: 'TB', marginx: 20, marginy: 20});
    this.nodes.forEach(node => this.graph.setNode(node.id, {label: node.id}));
    this.edges.forEach(edge => this.graph.setEdge(edge.sourceId, edge.targetId,
        {label: edge.comment, style: 'stroke: #888; stroke-width: 2px; fill: none;', arrowheadStyle: 'stroke: #888; fill: #888;',
          curve: d3.curveBasis}));

    this.graph.nodes().forEach((v: any) => {
      const d3Node = this.graph.node(v);
      const node = this.nodes.find(n => n.id === v);
      d3Node.rx = d3Node.ry = 10; // corner radius of the nodes
      d3Node.label = this.createNodeContent(node as any);
      (d3Node as any).labelType = 'html';
      let classes = encodeURI(v) + ' ' + node?.color;
      if (!this.edges.some(e => e.sourceId === node?.id)) {
        classes += ' endpoint';
      }
      if (node?.starter) {
        classes += ' starter';
      } else if (node?.winner) {
        classes += ' winner';
      } else if (node?.looser) {
        classes += ' looser';
      }
      d3Node.class = classes;
    });
  }

  private renderGraph() {
    d3.select('#visual-book-simplified').selectAll('*').remove();
    this.svg = d3.select('#visual-book-simplified');
    const inner = this.svg.append('g');
    this.zoomObj = d3.zoom().on('zoom', (event: any) => {
      inner.attr('transform', event.transform);
    });
    this.svg.call(this.zoomObj);
    const render = new dagreD3.render();
    render(inner, this.graph as any);
  }

  private initZoom(transform?: string) {
    const container = document.getElementById(VISUAL_BOOK_ID);
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
    this.edges = this.edges.filter(e => e.sourceId && e.targetId && e.sourceId !== e.targetId);
    this.edges = this.edges.filter(e => ids.some(id => e.sourceId === id) && ids.some(id => e.targetId === id));
  }

  private createNodeContent(node: VisualNode): string {
    const charLength = 30;
    let html = `<div class="node-container ${node.id} row">`;
    html += `<div class="title" title="${node.title}">`;
    let text = node.title;
    if (text.length <= charLength) {
      html += text;
    } else {
      do {
        const slice = text.slice(0, charLength);
        html += slice;
        text = text.slice(charLength);
        if (text.length) {
          html += '<br/>';
        }
      } while (text.length);
    }
    html += '</div>';

    if (node.starter) {
      html += '<div class="icon start"><span class="material-symbols-outlined">my_location</span></div>';
    } else if (node.winner) {
      html += '<div class="icon start">&#10026;</div>';
    } else if (node.looser) {
      html += '<div class="icon looser">&#128128;</div>';
    }
    html += '</div>';
    return html;
  }
}
