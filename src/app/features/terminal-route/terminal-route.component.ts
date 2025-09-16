
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Component, AfterViewInit, ViewChild, ViewChildren, QueryList } from '@angular/core';

import { terminalRouteMaster, terminalRouteVehicleAverages } from '../../../assets/mock-data/terminal-route-average';
import { TerminalRouteVehicleDialogComponent } from './terminal-route-vehicle-dialog/terminal-route-vehicle-dialog.component';
import { AppModule } from '../../app.module';


interface FuelTypeAverage {
  id: number;
  terminalRouteMasterId: number;
  fuelType: string;
  fuelTypeTotalPeak: number;
  fuelTypeTotalNonPeak: number;
  totalDaysPeak: number;
  totalDaysNonPeak: number;
  terminalRouteAveragePeak: number;
  terminalRouteAverageNonPeak: number;
  unitOfMeasure: string;
  createdDate: string;
  override: boolean;
  reasonForChange: string;
  fuelTypeDataSource?: MatTableDataSource<FuelTypeAverage>;
  _originalOverride?: boolean;
  _reasonEnabled?: boolean;
  [key: string]: any;
}

interface TerminalRouteMaster {
  id: number;
  terminalRouteFuelTypeAverages: FuelTypeAverage[];
  fuelTypeDataSource?: MatTableDataSource<FuelTypeAverage>;
  [key: string]: any;
}

@Component({
  selector: 'puro-terminal-route',
  templateUrl: './terminal-route.component.html',
  styleUrl: './terminal-route.component.scss',
  imports: [AppModule],
})
export class TerminalRouteComponent implements AfterViewInit {
  dataSource = new MatTableDataSource<TerminalRouteMaster>(terminalRouteMaster);

  displayedColumns = [
    'terminalNumber',
    'routeNumber',
    'province',
    'year',
    'fuelType',
    'terminalRouteAveragePeak',
    'terminalRouteAverageNonPeak',
    'terminalAveragePeak',
    'terminalAverageNonPeak',
    'unitOfMeasure',
    'createdBy',
    'createdDate',
  ];

  fuelTypeColumns: string[] = [
    'fuelType',
    'fuelTypeTotalPeak',
    'fuelTypeTotalNonPeak',
    'totalDaysPeak',
    'totalDaysNonPeak',
    'terminalRouteAveragePeak',
    'terminalRouteAverageNonPeak',
    'unitOfMeasure',
    'createdBy',
    'createdDate',
    'override',
    'reasonForChange',
    'actions',
  ];

  columnHeaderMap: Record<string, string> = {
    terminalNumber: 'Terminal #',
    routeNumber: 'Route #',
    province: 'Province',
    year: 'Year',
    fuelType: 'Fuel Type',
    terminalRouteAveragePeak: 'Route Avg (Peak)',
    terminalRouteAverageNonPeak: 'Route Avg (Non-Peak)',
    terminalAveragePeak: 'Terminal Avg (Peak)',
    terminalAverageNonPeak: 'Terminal Avg (Non-Peak)',
    unitOfMeasure: 'Unit of Measure',
    createdBy: 'Created By',
    createdDate: 'Created Date',
    terminalRouteMasterId: 'Master ID',
    fuelTypeTotalPeak: 'Fuel Total (Peak)',
    fuelTypeTotalNonPeak: 'Fuel Total (Non-Peak)',
    totalDaysPeak: 'Total Days (Peak)',
    totalDaysNonPeak: 'Total Days (Non-Peak)',
    override: 'Override',
    reasonForChange: 'Reason for Change',
    actions: 'Actions',
  };

  columnsToDisplayWithExpand = ['expand', ...this.displayedColumns];
  expandedElement: TerminalRouteMaster | null = null;
  hasChanges = false;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  @ViewChildren(MatSort) allSorts!: QueryList<MatSort>;

  constructor(private dialog: MatDialog, private snackBar: MatSnackBar) { }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    this.dataSource.data.forEach((master) => {
      master.terminalRouteFuelTypeAverages?.forEach((fta) => {
        fta._originalOverride = fta.override;
        fta._reasonEnabled = false;
      });
      master.fuelTypeDataSource = new MatTableDataSource<FuelTypeAverage>(
        master.terminalRouteFuelTypeAverages
      );
    });
  }

  toggle(element: TerminalRouteMaster) {
    this.expandedElement = this.expandedElement === element ? null : element;

    setTimeout(() => {
      const sortArray = this.allSorts.toArray();
      const index = this.dataSource.data.findIndex(m => m.id === element.id);

      if (element.fuelTypeDataSource && sortArray[index + 1]) {
        // +1 because main table MatSort comes first
        element.fuelTypeDataSource.sort = sortArray[index + 1];
      }
    });
  }

  isExpanded(element: TerminalRouteMaster) {
    return this.expandedElement === element;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value
      .trim()
      .toLowerCase();
    this.dataSource.filter = filterValue;
  }

  openVehicleDialog(id: number): void {
    const vehicleData = terminalRouteVehicleAverages.filter(
      (v) => v.terminalRouteFuelTypeAverageId === id
    );

    const dialogRef = this.dialog.open(TerminalRouteVehicleDialogComponent, {
      width: '90vw',
      maxWidth: '98vw',
      minHeight: '50vh',
      maxHeight: '95vh',
      panelClass: 'custom-dialog-container',
      data: { vehicleData, masterId: this.expandedElement?.id },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result?.reload) {
        this.expandedElement =
          this.dataSource.data.find((m) => m.id === result.masterId) || null;
      }
    });
  }

  onOverrideChange(changedFTA: FuelTypeAverage, master: TerminalRouteMaster) {
    // If the clicked checkbox was turned on
    if (changedFTA.override) {
      master.terminalRouteFuelTypeAverages.forEach((fta) => {
        if (
          fta.id !== changedFTA.id &&
          !this.isOverrideDisabled(master, fta)
        ) {
          fta.override = false;
          fta._reasonEnabled = false;
        }
      });
    }

    // Enable reason input if override has changed from original
    changedFTA._reasonEnabled = changedFTA.override !== changedFTA._originalOverride;

    this.hasChanges = this.dataSource.data.some((m) =>
      m.terminalRouteFuelTypeAverages.some(
        (f) => f.override !== f._originalOverride
      )
    );
  }


  onSave() {
    const updatedFTAs: {
      id: number;
      override: boolean;
      reasonForChange: string;
    }[] = [];
    const expandedIds: number[] = [];

    let hasInvalid = false;

    this.dataSource.data.forEach((master) => {
      if (this.isExpanded(master)) {
        expandedIds.push(master.id);
      }

      master.terminalRouteFuelTypeAverages.forEach((fta) => {
        if (fta.override !== fta._originalOverride) {
          if (!fta.reasonForChange?.trim()) {
            hasInvalid = true;
          } else {
            updatedFTAs.push({
              id: fta.id,
              override: fta.override,
              reasonForChange: fta.reasonForChange.trim(),
            });
          }
        }
      });
    });

    if (hasInvalid) {
      this.snackBar.open(
        'Please enter a reason for all overridden changes.',
        'Close',
        { duration: 3000 }

      );
      return;
    }

    if (updatedFTAs.length === 0) {
      this.snackBar.open(
        'No changes detected to save.',
        'Close',
        { duration: 3000 }
      );
      return;
    }

    console.log('✅ Updated FTA Records:', updatedFTAs);
    console.log('📂 Expanded TerminalRouteMaster IDs:', expandedIds);

    // Here you could also send the updatedFTAs to your backend

    this.snackBar.open(
      '✅ Changes saved and recalculation triggered successfully.',
      'Close',
      {
        duration: 3000,
        panelClass: ['snackbar-success']
      }
    );

    this.resetChanges();
  }

  resetChanges() {
    this.dataSource.data.forEach((master) => {
      master.terminalRouteFuelTypeAverages.forEach((fta) => {
        fta._originalOverride = fta.override;
        fta._reasonEnabled = false;
      });
    });
    this.hasChanges = false;
  }

  /**
   * Disable override checkbox if the detail fuelType equals master fuelType.
   */
  isOverrideDisabled(
    master: TerminalRouteMaster,
    fta: FuelTypeAverage
  ): boolean {
    return master['fuelType'] === fta['fuelType'];
  }
}
