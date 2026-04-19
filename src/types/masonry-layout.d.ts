declare module "masonry-layout" {
  type MasonryOptions = {
    columnWidth?: string | number | Element;
    gutter?: string | number | Element;
    horizontalOrder?: boolean;
    itemSelector?: string;
    percentPosition?: boolean;
    transitionDuration?: number | string;
  };

  export default class Masonry {
    constructor(element: Element, options?: MasonryOptions);
    destroy(): void;
    layout(): void;
    reloadItems(): void;
  }
}
