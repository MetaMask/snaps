import { getDesignTokens } from './utils';

describe('getDesignTokens', () => {
  it('returns design tokens', () => {
    expect(getDesignTokens('colors')).toMatchInlineSnapshot(`
      {
        "background": {
          "alternative": {
            "_dark": "#141618",
            "default": "#f2f4f6",
          },
          "alternativeHover": {
            "_dark": "#1f2123",
            "default": "#e7ebee",
          },
          "alternativePressed": {
            "_dark": "#2e3033",
            "default": "#dbe0e6",
          },
          "default": {
            "_dark": "#24272a",
            "default": "#ffffff",
          },
          "defaultHover": {
            "_dark": "#313235",
            "default": "#f5f5f5",
          },
          "defaultPressed": {
            "_dark": "#3f4145",
            "default": "#ebebeb",
          },
          "hover": {
            "_dark": "#ffffff0a",
            "default": "#0000000a",
          },
          "pressed": {
            "_dark": "#ffffff14",
            "default": "#00000014",
          },
        },
        "border": {
          "default": {
            "_dark": "#848c96",
            "default": "#bbc0c5",
          },
          "muted": {
            "_dark": "#848c9629",
            "default": "#bbc0c566",
          },
        },
        "error": {
          "alternative": {
            "_dark": "#f1b9be",
            "default": "#8e1d28",
          },
          "default": {
            "_dark": "#e88f97",
            "default": "#d73847",
          },
          "defaultHover": {
            "_dark": "#e47782",
            "default": "#d02a3a",
          },
          "defaultPressed": {
            "_dark": "#e78891",
            "default": "#bf2635",
          },
          "inverse": {
            "_dark": "#141618",
            "default": "#ffffff",
          },
          "muted": {
            "_dark": "#e88f9726",
            "default": "#d738471a",
          },
        },
        "flask": {
          "default": {
            "_dark": "#d27dff",
            "default": "#8b45b6",
          },
          "inverse": {
            "_dark": "#141618",
            "default": "#ffffff",
          },
        },
        "icon": {
          "alternative": {
            "_dark": "#bbc0c5",
            "default": "#6a737d",
          },
          "default": {
            "_dark": "#ffffff",
            "default": "#141618",
          },
          "muted": {
            "_dark": "#848c96",
            "default": "#9fa6ae",
          },
        },
        "info": {
          "default": {
            "_dark": "#43aefc",
            "default": "#0376c9",
          },
          "inverse": {
            "_dark": "#141618",
            "default": "#ffffff",
          },
          "muted": {
            "_dark": "#43aefc26",
            "default": "#0376c91a",
          },
        },
        "overlay": {
          "alternative": {
            "_dark": "#000000cc",
            "default": "#000000cc",
          },
          "default": {
            "_dark": "#00000099",
            "default": "#00000099",
          },
          "inverse": {
            "_dark": "#ffffff",
            "default": "#ffffff",
          },
        },
        "primary": {
          "alternative": {
            "_dark": "#75c4fd",
            "default": "#0260a4",
          },
          "default": {
            "_dark": "#43aefc",
            "default": "#0376c9",
          },
          "defaultHover": {
            "_dark": "#26a2fc",
            "default": "#036ab5",
          },
          "defaultPressed": {
            "_dark": "#3baafd",
            "default": "#025ea1",
          },
          "inverse": {
            "_dark": "#141618",
            "default": "#ffffff",
          },
          "muted": {
            "_dark": "#43aefc26",
            "default": "#0376c91a",
          },
        },
        "shadow": {
          "default": {
            "_dark": "#00000066",
            "default": "#0000001a",
          },
          "error": {
            "_dark": "#ff758466",
            "default": "#ca354266",
          },
          "primary": {
            "_dark": "#43aefc33",
            "default": "#0376c933",
          },
        },
        "success": {
          "default": {
            "_dark": "#28a745",
            "default": "#1c8234",
          },
          "defaultHover": {
            "_dark": "#2cb94c",
            "default": "#18712d",
          },
          "defaultPressed": {
            "_dark": "#30ca53",
            "default": "#156127",
          },
          "inverse": {
            "_dark": "#141618",
            "default": "#ffffff",
          },
          "muted": {
            "_dark": "#28a74526",
            "default": "#1c82341a",
          },
        },
        "text": {
          "alternative": {
            "_dark": "#bbc0c5",
            "default": "#6a737d",
          },
          "default": {
            "_dark": "#ffffff",
            "default": "#141618",
          },
          "muted": {
            "_dark": "#848c96",
            "default": "#9fa6ae",
          },
        },
        "warning": {
          "default": {
            "_dark": "#ffdf70",
            "default": "#bf5208",
          },
          "defaultHover": {
            "_dark": "#ffe485",
            "default": "#ac4a07",
          },
          "defaultPressed": {
            "_dark": "#ffe899",
            "default": "#984106",
          },
          "inverse": {
            "_dark": "#141618",
            "default": "#ffffff",
          },
          "muted": {
            "_dark": "#ffdf7026",
            "default": "#bf52081a",
          },
        },
      }
    `);
  });
});
