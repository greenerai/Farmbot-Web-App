import { boardType } from "../firmware_hardware_support";

describe("boardType()", () => {
  it("returns Farmduino", () => {
    expect(boardType("5.0.3.F.extra")).toEqual("farmduino");
  });

  it("returns Farmduino k1.4", () => {
    expect(boardType("5.0.3.G")).toEqual("farmduino_k14");
  });

  it("returns Farmduino k1.5", () => {
    expect(boardType("5.0.3.H")).toEqual("farmduino_k15");
  });

  it("returns Farmduino Express k1.0", () => {
    expect(boardType("5.0.3.E")).toEqual("express_k10");
  });

  it("returns Arduino/RAMPS", () => {
    expect(boardType("5.0.3.R")).toEqual("arduino");
  });

  it("returns unknown", () => {
    expect(boardType(undefined)).toEqual("unknown");
    expect(boardType("Arduino Disconnected!")).toEqual("unknown");
    expect(boardType("STUBFW")).toEqual("unknown");
    expect(boardType("0.0.0.S.STUB")).toEqual("unknown");
  });

  it("returns None", () => {
    expect(boardType("none")).toEqual("none");
  });
});
