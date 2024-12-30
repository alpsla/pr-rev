const renderToString = jest.fn().mockImplementation((component) => 'mock-rendered-string');
const render = jest.fn().mockImplementation((component) => 'mock-rendered-string');
const shallowRender = jest.fn().mockImplementation((component) => 'mock-rendered-string');

module.exports = {
  renderToString,
  render,
  shallowRender,
  default: render,
  __esModule: true
};
