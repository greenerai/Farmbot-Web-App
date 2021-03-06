jest.mock("../../../api/crud", () => ({
  init: jest.fn(() => ({ type: "", payload: { uuid: "fakeUuid" } })),
  save: jest.fn(),
  edit: jest.fn(),
  destroy: jest.fn(),
}));

jest.mock("../../../history", () => ({ history: { push: jest.fn() } }));

import * as React from "react";
import { mount, shallow } from "enzyme";
import {
  RawAddToolSlot as AddToolSlot, AddToolSlotProps, mapStateToProps
} from "../add_tool_slot";
import { fakeState } from "../../../__test_support__/fake_state";
import {
  fakeTool, fakeToolSlot
} from "../../../__test_support__/fake_state/resources";
import {
  buildResourceIndex
} from "../../../__test_support__/resource_index_builder";
import { init, save, edit, destroy } from "../../../api/crud";
import { history } from "../../../history";
import { SpecialStatus } from "farmbot";

describe("<AddToolSlot />", () => {
  const fakeProps = (): AddToolSlotProps => ({
    tools: [],
    findTool: jest.fn(),
    botPosition: { x: undefined, y: undefined, z: undefined },
    dispatch: jest.fn(),
    findToolSlot: fakeToolSlot,
  });

  it("renders", () => {
    const wrapper = mount(<AddToolSlot {...fakeProps()} />);
    ["add new tool slot", "x (mm)", "y (mm)", "z (mm)", "toolnone",
      "change slot direction", "use current location", "gantry-mounted"
    ].map(string => expect(wrapper.text().toLowerCase()).toContain(string));
    expect(init).toHaveBeenCalled();
  });

  it("renders while loading", () => {
    const p = fakeProps();
    p.findToolSlot = () => undefined;
    const wrapper = mount(<AddToolSlot {...p} />);
    expect(wrapper.text()).toContain("initializing");
  });

  it("updates tool slot", () => {
    const toolSlot = fakeToolSlot();
    const p = fakeProps();
    const wrapper = mount<AddToolSlot>(<AddToolSlot {...p} />);
    wrapper.instance().updateSlot(toolSlot)({ x: 123 });
    expect(edit).toHaveBeenCalledWith(toolSlot, { x: 123 });
  });

  it("saves tool slot", () => {
    const wrapper = shallow<AddToolSlot>(<AddToolSlot {...fakeProps()} />);
    wrapper.find("SaveBtn").simulate("click");
    expect(save).toHaveBeenCalled();
    expect(history.push).toHaveBeenCalledWith("/app/designer/tools");
  });

  it("saves on unmount", () => {
    const toolSlot = fakeToolSlot();
    toolSlot.specialStatus = SpecialStatus.DIRTY;
    const p = fakeProps();
    p.findToolSlot = () => toolSlot;
    const wrapper = mount<AddToolSlot>(<AddToolSlot {...p} />);
    window.confirm = () => true;
    wrapper.unmount();
    expect(save).toHaveBeenCalledWith("fakeUuid");
  });

  it("destroys on unmount", () => {
    const toolSlot = fakeToolSlot();
    toolSlot.specialStatus = SpecialStatus.DIRTY;
    const p = fakeProps();
    p.findToolSlot = () => toolSlot;
    const wrapper = mount<AddToolSlot>(<AddToolSlot {...p} />);
    window.confirm = () => false;
    wrapper.unmount();
    expect(destroy).toHaveBeenCalledWith("fakeUuid", true);
  });

  it("doesn't confirm save", () => {
    const toolSlot = fakeToolSlot();
    toolSlot.specialStatus = SpecialStatus.SAVED;
    const p = fakeProps();
    p.findToolSlot = () => toolSlot;
    const wrapper = mount<AddToolSlot>(<AddToolSlot {...p} />);
    window.confirm = jest.fn();
    wrapper.unmount();
    expect(destroy).not.toHaveBeenCalled();
    expect(save).not.toHaveBeenCalled();
  });

  it("can't find tool without tool slot", () => {
    const p = fakeProps();
    p.findToolSlot = () => undefined;
    const wrapper = mount<AddToolSlot>(<AddToolSlot {...p} />);
    expect(wrapper.instance().tool).toEqual(undefined);
  });
});

describe("mapStateToProps()", () => {
  it("returns props", () => {
    const tool = fakeTool();
    tool.body.id = 1;
    const toolSlot = fakeToolSlot();
    const state = fakeState();
    state.resources = buildResourceIndex([tool, toolSlot]);
    const props = mapStateToProps(state);
    expect(props.findTool(1)).toEqual(tool);
    expect(props.findToolSlot(toolSlot.uuid)).toEqual(toolSlot);
  });
});
