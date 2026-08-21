import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LetterChallengeInput, { ChallengeTimer } from "./LetterChallengeInput";

const LETTERS = ["A", "B", "C", "D", "E", "F", "G", "H"];

const setup = (overrides = {}) => {
  const props = {
    letters: LETTERS,
    answers: new Array(LETTERS.length).fill(""),
    onChange: jest.fn(),
    disabled: false,
    ...overrides,
  };
  const utils = render(<LetterChallengeInput {...props} />);
  return { ...utils, props, inputs: screen.getAllByRole("textbox") };
};

describe("LetterChallengeInput", () => {
  test("renders all 8 letters and 8 single-digit inputs", () => {
    const { inputs } = setup();
    LETTERS.forEach((letter) => {
      expect(screen.getByText(letter)).toBeInTheDocument();
    });
    expect(inputs).toHaveLength(8);
    inputs.forEach((input) => {
      expect(input).toHaveAttribute("maxlength", "1");
      expect(input).toHaveAttribute("inputmode", "numeric");
    });
  });

  test("typing a digit calls onChange(index, digit) and moves focus to the next input", () => {
    const { props, inputs } = setup();
    userEvent.type(inputs[0], "5");
    expect(props.onChange).toHaveBeenCalledTimes(1);
    expect(props.onChange).toHaveBeenCalledWith(0, "5");
    expect(inputs[1]).toHaveFocus();
  });

  test("typing into the LAST input does not move focus", () => {
    const { props, inputs } = setup();
    userEvent.type(inputs[7], "9");
    expect(props.onChange).toHaveBeenCalledWith(7, "9");
    expect(inputs[7]).toHaveFocus();
  });

  test("non-digit input is rejected — onChange never fires", () => {
    const { props, inputs } = setup();
    userEvent.type(inputs[0], "x");
    userEvent.type(inputs[0], "!");
    expect(props.onChange).not.toHaveBeenCalled();
  });

  test("pasting '12345678' fills all 8 answers in order and focuses the last input", () => {
    const { props, inputs } = setup();
    fireEvent.paste(inputs[0], {
      clipboardData: { getData: () => "12345678" },
    });
    expect(props.onChange).toHaveBeenCalledTimes(8);
    for (let i = 0; i < 8; i += 1) {
      expect(props.onChange).toHaveBeenNthCalledWith(i + 1, i, String(i + 1));
    }
    expect(inputs[7]).toHaveFocus();
  });

  test("paste strips non-digits before filling ('1-2-3-4-5-6-7-8' works)", () => {
    const { props, inputs } = setup();
    fireEvent.paste(inputs[0], {
      clipboardData: { getData: () => "1-2-3-4-5-6-7-8" },
    });
    expect(props.onChange).toHaveBeenCalledTimes(8);
    expect(props.onChange).toHaveBeenNthCalledWith(8, 7, "8");
  });

  test("paste with too few digits is ignored", () => {
    const { props, inputs } = setup();
    fireEvent.paste(inputs[0], {
      clipboardData: { getData: () => "123" },
    });
    expect(props.onChange).not.toHaveBeenCalled();
  });

  test("Backspace on an empty input moves focus back to the previous input", () => {
    const { inputs } = setup();
    inputs[3].focus();
    fireEvent.keyDown(inputs[3], { key: "Backspace" });
    expect(inputs[2]).toHaveFocus();
  });

  test("disabled prop disables every input", () => {
    const { inputs } = setup({ disabled: true });
    inputs.forEach((input) => expect(input).toBeDisabled());
  });
});

describe("ChallengeTimer", () => {
  test("formats seconds as m:ss", () => {
    render(<ChallengeTimer secondsLeft={125} />);
    expect(screen.getByText(/2:05/)).toBeInTheDocument();
  });

  test("turns red at 30 seconds or less", () => {
    const { container } = render(<ChallengeTimer secondsLeft={30} />);
    expect(container.querySelector("span")).toHaveClass("text-red-600");
  });
});
