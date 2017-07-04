import { GraphtolearnPage } from './app.po';

describe('graphtolearn App', () => {
  let page: GraphtolearnPage;

  beforeEach(() => {
    page = new GraphtolearnPage();
  });

  it('should display welcome message', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('Welcome to app!!');
  });
});
