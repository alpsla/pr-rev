const h = jest.fn((type, props, ...children) => ({
  type,
  props: { ...props, children: children.length ? children : undefined }
}));

const Fragment = Symbol.for('preact.Fragment');
const Component = class {};
const createContext = jest.fn(() => ({
  Provider: jest.fn(),
  Consumer: jest.fn()
}));
const createRef = jest.fn(() => ({ current: null }));
const render = jest.fn();
const hydrate = jest.fn();
const isValidElement = jest.fn(() => true);
const cloneElement = jest.fn((element) => ({ ...element }));
const toChildArray = jest.fn((children) => [].concat(children).filter(Boolean));
const options = {};

module.exports = {
  h,
  Fragment,
  Component,
  createContext,
  createElement: h,
  createRef,
  hydrate,
  isValidElement,
  options,
  render,
  toChildArray,
  cloneElement,
  __esModule: true
};
