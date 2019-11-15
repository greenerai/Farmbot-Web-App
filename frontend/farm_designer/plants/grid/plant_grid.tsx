import React from "react";
import { BlurableInput } from "../../../ui";
import {
  EMPTY_PLANT_GRID,
  PlantGridKey,
  plantGridKeys,
  PlantGridProps,
  PlantGridState
} from "./constants";
import { initPlantGrid } from "./generate_grid";
import { init } from "../../../api/crud";
import { uuid } from "farmbot";
import { saveGrid, stashGrid } from "./thunks";
import { error } from "../../../toast/toast";
import { t } from "../../../i18next_wrapper";

export class PlantGrid extends React.Component<PlantGridProps, PlantGridState> {
  state: PlantGridState = {
    ...EMPTY_PLANT_GRID,
    gridId: uuid()
  };

  onchange = (key: PlantGridKey) =>
    (x: React.ChangeEvent<HTMLInputElement>) => this.setState({
      ...this.state,
      grid: { ...this.state.grid, [key]: parseInt(x.currentTarget.value, 10) }
    });

  performPreview = () => {
    const { numPlantsH, numPlantsV } = this.state.grid;
    const total = numPlantsH * numPlantsV;
    if (total > 100) {
      error(t("Please make a grid with less than 100 plants"));
      return;
    }

    const plants = initPlantGrid({
      grid: this.state.grid,
      openfarm_slug: this.props.openfarm_slug,
      gridId: this.state.gridId
    });
    plants.map(p => this.props.dispatch(init("Point", p)));
    this.setState({ status: "dirty" });
  }

  revertPreview = () => {
    const p: Promise<{}> = this.props.dispatch(stashGrid(this.state.gridId));
    p.then(() => this.setState(EMPTY_PLANT_GRID));
  }

  saveGrid = () => {
    const p: Promise<{}> = this.props.dispatch(saveGrid(this.state.gridId));
    p.then(() => this.setState(EMPTY_PLANT_GRID));
  }

  inputs = () => {
    return plantGridKeys.map(key => {
      return <div key={key}>
        {key}
        <BlurableInput
          disabled={this.state.status === "dirty"}
          value={this.state.grid[key]}
          onCommit={this.onchange(key)} />
      </div>;
    });
  }

  buttons = () => {
    switch (this.state.status) {
      case "clean":
        return <div>
          <button onClick={this.performPreview}>
            Preview
          </button>
        </div>;
      case "dirty":
        return <div>
          <button onClick={this.saveGrid}>
            Save
          </button>
          <button onClick={this.revertPreview}>
            Clear
          </button>
        </div>;
    }
  }

  render() {
    return <div>
      <hr />
      {this.inputs()}
      {this.buttons()}
    </div>;
  }
}
