
import { MatSort } from '@angular/material/sort';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Component, Inject, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { AppModule } from '../../../app.module';

interface Vehicle {
  timecard_date: string;
  terminal_id: number;
  route_number: string;
  pcl_agent_flag: boolean;
  primary_fuel_type: string;
  trip_date: string;
  total_fuel_adjusted: number;
  energy_used_kwh: number;
  skip_calculation: boolean;
  vehicle_id: number;
  asset_number: string;
  originalSkipCalculation: boolean;
}

@Component({
  selector: 'app-terminal-route-vehicle-dialog',
  standalone: true,
  templateUrl: './terminal-route-vehicle-dialog.component.html',
  styleUrls: ['./terminal-route-vehicle-dialog.component.scss'],
  imports: [AppModule],
})
export class TerminalRouteVehicleDialogComponent
  implements OnInit, AfterViewInit {
  displayedColumns: string[] = [
    "timecard_date",
    "terminal_id",
    "route_number",
    "pcl_agent_flag",
    "vehicle_id",
    "asset_number",
    "primary_fuel_type",
    "trip_date",
    "total_fuel_adjusted",
    "energy_used_kwh",
    "skip_calculation",
  ];

  dataSource = new MatTableDataSource<Vehicle>();
  isLoading = true;
  isSaving = false;
  pendingChanges: { id: number; skipCalculation: boolean }[] = [];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<TerminalRouteVehicleDialogComponent>,
    private snackBar: MatSnackBar
  ) { }


  ngOnInit(): void {
    setTimeout(() => {
      this.dataSource.data = (this.data.vehicleData || []).map(
        (vehicle: Vehicle) => ({
          ...vehicle,
          skip_calculation: true, // Set default to true (checked)
          originalSkipCalculation: vehicle.skip_calculation,
        })
      );
      this.isLoading = false;
    }, 500);
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value
      .trim()
      .toLowerCase();
    this.dataSource.filter = filterValue;
  }

  onCheckboxChange(vehicle: Vehicle) {
    const id = vehicle.terminal_id;
    const original = vehicle.originalSkipCalculation;
    const current = vehicle.skip_calculation;

    const index = this.pendingChanges.findIndex((v) => v.id === id);

    if (current === original) {
      if (index !== -1) {
        this.pendingChanges.splice(index, 1);
      }
    } else {
      if (index !== -1) {
        this.pendingChanges[index].skipCalculation = current;
      } else {
        this.pendingChanges.push({ id, skipCalculation: current });
      }
    }
  }

  saveChanges() {
    if (this.pendingChanges.length === 0) return;

    this.isSaving = true;

    const updatedIds = this.pendingChanges.map(c => c.id);

    console.log('Saving changes:', this.pendingChanges);

    // 🚀 simulate backend call
    setTimeout(() => {
      console.log('✅ Changes saved.');
      this.snackBar.open(
        `✅ Recalculated successfully. Updated ${updatedIds.length} vehicles.`,
        'Close',
        { duration: 3000, panelClass: ['snackbar-success'] }
      );
      this.dialogRef.close({
        reload: true,
        updatedIds: updatedIds,
        pendingChanges: this.pendingChanges,
        masterId: this.data.masterId
      });
    }, 1500);
  }

  closeDialog() {
    this.dialogRef.close();
  }

}
