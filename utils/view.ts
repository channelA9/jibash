export class View {
  current: string;
  constructor(view: string) {
    this.current = view;
  }
  setView(newView: string) {
    this.current = newView;
  }
}
