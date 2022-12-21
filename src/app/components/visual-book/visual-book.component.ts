import {Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewEncapsulation} from '@angular/core';
import * as dagreD3 from 'dagre-d3';
import * as d3 from 'd3';
import {VisualEdge, VisualNode} from '../../model/visual-book.model';

const VISUAL_BOOK_ID = 'visual-book';

@Component({
  selector: 'app-visual-book',
  template: '<svg id="visual-book"></svg>',
  styleUrls: ['./visual-book.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class VisualBookComponent implements OnChanges {

  @Input() nodes: VisualNode[] = [];
  @Input() edges: VisualEdge[] = [];
  @Input() trigger: string = '';
  @Input() selectable = true;
  @Input() selected: string = '';
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

  ngOnChanges(changes: SimpleChanges): void {
    const edgesChanged = changes['edges'] && changes['edges'].previousValue && changes['edges'].previousValue.length !== changes['edges'].currentValue.length;
    const nodeChanged = changes['nodes'] && changes['nodes'].previousValue && changes['nodes'].previousValue.length !== changes['nodes'].currentValue.length;
    const selectedChanged = changes['selected'] && changes['selected'].previousValue !== changes['selected'].currentValue;
    if(selectedChanged && !edgesChanged && !nodeChanged) {
      if (this.selected && this.nodes.some(n => n.id === this.selected)) {
        this.selectNode(this.selected);
      }
    } else {
      if (this.nodes && this.nodes.length) {
        let transform;
        const group = document.getElementById(VISUAL_BOOK_ID)?.getElementsByTagName('g');
        const transformGroup = group ? group[0] : null;
        if (transformGroup) {
          transform = transformGroup.getAttribute('transform');
        }
        this.cleanUpData();
        this.drawGraph();
        this.renderGraph();
        this.setSelectableNodes();
        this.initZoom(transform as any);
        if (this.selected && this.nodes.some(n => n.id === this.selected)) {
          this.selectNode(this.selected);
        }
      } else {
        this.cleanUpData();
        this.drawGraph();
        this.renderGraph();
      }
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
        // (height - this.graph.graph().height * initialScale) / 2 // middle horizontally
      ).scale(initialScale));
    }
  }

  selectNode(id: string) {
    if (this.selectable && this.nodes.some(n => n.id === id)) {
      const d3Node = d3.selectAll('.' + id);
      if (d3Node) {
        const classes = d3Node.attr('class');
        if (classes.indexOf('selected') !== -1) {
          //d3Node.attr('class', classes.replace('selected', '').trim());
        } else {
          if (!this.multiSelect) {
            VisualBookComponent.deselectAllComponents();
          }
          d3Node.attr('class', classes + ' selected');
        }
      }
    }
  }

  private drawGraph() {
    this.graph = new dagreD3.graphlib.Graph();
    this.graph.setGraph({nodesep: 70, ranksep: 50, rankdir: 'TB', marginx: 20, marginy: 20});
    this.nodes.forEach(node => this.graph.setNode(node.id, {label: node.id}));
    this.edges.forEach(edge => {
      let strokeStyle = 'stroke: #888; stroke-width: 2px; fill: none;';
      let arrowheadStyle = 'stroke: #888; fill: #888;';
      if (edge.condition) {
        strokeStyle = 'stroke: #1399d3; stroke-width: 2px; fill: none; stroke-dasharray: 0, 2, 2';
        arrowheadStyle = 'stroke: #1399d3; fill: #1399d3;';
      }
      this.graph.setEdge(edge.sourceId, edge.targetId,
        {label: edge.comment, style: strokeStyle, arrowheadStyle, curve: d3.curveBasis});
    });
    this.graph.nodes().forEach((v: any) => {
      const d3Node = this.graph.node(v);
      const node = this.nodes.find(n => n.id === v);
      d3Node.rx = d3Node.ry = 10; // corner radius of the nodes
      d3Node.label = this.createNodeContent(node as any);
      (d3Node as any).labelType = 'html';
      let classes = encodeURI(v) + (this.selectable ? ' selectable' : '') + ' ' + node?.color;
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
    d3.select('#visual-book').selectAll('*').remove();
    this.svg = d3.select('#visual-book');
    const inner = this.svg.append('g');

    /*this.svg.on('click', () => {
      VisualBookComponent.deselectAllComponents();
      this.nodeSelected.emit();
    });*/

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
            VisualBookComponent.deselectAllComponents();
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
    if (node.alert) {
      html += '<span class="material-symbols-outlined">error</span>';
    }
    if (node.warning) {
      html += '<span class="material-symbols-outlined warning">warning</span>';
    }
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

    if (node.heart || node.skull || node.present) {
      html += '<div class="icon">';
      if (node.heart) {
        html += '&#x1F9E1;' + (node.heart > 1 ? ' ' + node.heart : '');
      }
      if (node.skull) {
        html += '&#128128;' + (node.skull > 1 ? ' ' + node.skull : '');
      }
      if (node.present) {
        html += '&#127873;';
      }
      html += '</div>';
    }
    html += '</div>';
    return html;
  }
}
