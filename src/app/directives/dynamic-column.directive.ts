import { Directive, Input, OnInit, ViewContainerRef } from '@angular/core';
import { MatColumnDef } from '@angular/material/table';

@Directive({
  selector: '[dynamicColumnDef]',
  providers: [{ provide: MatColumnDef, useExisting: DynamicColumnDirective }]
})
export class DynamicColumnDirective extends MatColumnDef implements OnInit {
  @Input('dynamicColumnDef') columnName!: string;

  constructor(private viewContainer: ViewContainerRef) {
    super();
  }

  ngOnInit(): void {
    this.name = this.columnName;
  }
}
