import { Component, OnInit, Input } from '@angular/core';
import { IWidget, WIDGET_TYPES, WIDGET_NAMES } from '../interfaces';

@Component({
  selector: 'app-editable-widget',
  templateUrl: './editable-widget.component.html',
  styleUrls: ['./editable-widget.component.css']
})
export class EditableWidgetComponent implements OnInit {

  @Input() widget: IWidget;
  WIDGET_TYPES = WIDGET_TYPES;
  WIDGET_NAMES = WIDGET_NAMES;
  Object = Object;

  constructor() { }

  ngOnInit() {
    if (!this.widget.props) {
      this.widget.props = { question: 'Untitled Question' };
    }
  }

}
