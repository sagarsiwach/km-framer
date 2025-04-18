```markdown
# Framer Development Documentation

## Code Components

### What are Code Components?
Code Components are React Components that extend Framer's capabilities by rendering directly on the canvas, in preview, and on published sites. They are written in Framer's built-in code editor.

*   **Note:** Must use React 18 compatible code.

**Core Features:**
*   **Property Controls:** Manipulate component props visually via the properties panel.
*   **Auto-Sizing:** Custom sizing options to work well in any layout.
*   **Sharing:** Shareable via a unique, versioned URL.

### Basics
1.  Go to `Assets` panel -> `Code` -> `Create Code File`.
2.  A new file exporting a React component is created.
3.  Use the top-right preview button for a live split preview while editing.

### Component Examples

**Simple Component:**
```jsx
// Simplest component
export default function Button(props) {
    return <div>Hello</div>
}
```

**With Styling:**
```jsx
// Adding inline styles
export default function Button(props) {
    const style = {
        display: "inline-block",
        backgroundColor: "orange",
        padding: 8,
    }
    return <div style={style}>Hello</div>
}
```

**With Property Controls:**
```jsx
import { addPropertyControls, ControlType } from "framer"

export default function Button(props) {
    const style = {
        display: "inline-block",
        backgroundColor: "orange",
        padding: 8,
    }
    // Use the 'text' prop passed from the controls
    return <div style={style}>{props.text}</div>
}

// Default value for the prop
Button.defaultProps = {
    text: "My Title",
}

// Define the property control
addPropertyControls(Button, {
    text: {
        title: "Text",
        type: ControlType.String,
    },
})
```

### Sharing Components
Code Components use ES Modules, providing a unique URL for sharing.
1.  Find the component under `Assets` -> `Code Component`.
2.  Right-click -> `Copy URL...`.
3.  Paste the URL onto any Framer canvas.
4.  Shared components can show an "Update" CTA when the original changes.

**URL Formats:**
*   Latest: `https://framer.com/m/Button-5TDo.js`
*   Specific Version: `https://framer.com/m/Button-5TDo.js@rXSyWUm5fMakCtp8K3gM`

**Preventing Unlinking:**
Add the `@framerDisableUnlink` annotation directly above the component export to prevent users from easily unlinking the instance from the code component.
```jsx
/**
 * @framerDisableUnlink
 * @framerIntrinsicWidth 200 // Example of other annotations
 */
export default function MyComponent(props) {
  // ... component code ...
}
```
*   **Note:** This does not secure the code; it can still be inspected using browser developer tools.

### Auto-Sizing
Framer measures content accurately. Define how your component sizes using annotations.

**Size Definitions (Annotations):**
Set layout options using `@framerSupportedLayoutWidth` and `@framerSupportedLayoutHeight`.
*   `auto`: Component dictates size based on content.
*   `fixed`: Component fills a fixed-size container (100% width/height).
*   `any`: User can switch between `auto` and `fixed` (default).
*   `any-prefer-fixed`: Same as `any`, but defaults to `fixed`.

**Specifying Options:**
Annotations must be directly above the component declaration.
```jsx
/**
 * @framerSupportedLayoutWidth auto
 * @framerSupportedLayoutHeight fixed
 */
export function MyComponent(props) { /* ... */ }
```

**Intrinsic Size:**
Define the default size when `fixed` sizing is enabled using `@framerIntrinsicWidth` and `@framerIntrinsicHeight`.
```jsx
/**
 * @framerIntrinsicWidth 200
 * @framerIntrinsicHeight 200
 */
export function Box(props) { /* ... */ }
```

**Supporting `any` (Default):**
Spread the `style` prop onto your root element. Framer passes `{ width: "100%", height: "100%" }` via `style` when sizing is `fixed`.
```jsx
export function MyComponent(props) {
    const { style } = props; // Destructure style from props
    return <div style={{ /* your base styles */, ...style }} />;
}
```

**Auto-Sizing Dynamically:**
Use `useLayoutEffect` for size changes based on internal state or props.
```jsx
import { useState, useLayoutEffect } from "react"

/**
 * @framerSupportedLayoutWidth auto
 * @framerSupportedLayoutHeight auto
 */
export default function DynamicSizeComponent(props) {
    const [items, setItems] = useState(props.initialItems || 1);

    useLayoutEffect(() => {
        // Logic to potentially update size based on state/props
    }, [items]); // Dependency array

    // Render based on state affecting size
    return <div style={{ /* styles */ }}>{/* Content based on 'items' */}</div>;
}
```

**Measuring Absolute Size:**
Use the `useMeasuredSize` hook (imports from a Framer URL) to get pixel dimensions. Use sparingly due to performance implications.
```jsx
import { useMeasuredSize } from "https://framer.com/m/framer/useMeasuredSize.js"
import { useRef } from "react";

/**
 * @framerSupportedLayoutWidth fixed
 * @framerSupportedLayoutHeight any
 */
export function MeasuredComponent(props) {
  const containerRef = useRef(null);
  const size = useMeasuredSize(containerRef);
  const width = size?.width ?? 50;
  const height = size?.height ?? 50;

  return (
      <div ref={containerRef} style={{ ...props.style, /* use width/height */ }}>
          {/* Content */}
      </div>
    );
}
```

### Property Controls
Allow users to configure component props via the Framer UI.

**Adding Controls:**
Use `addPropertyControls` from the `framer` library. Pass the component and a configuration object. Use `ControlType` enum for types. Define `defaultProps` for initial values.
```jsx
import { addPropertyControls, ControlType } from "framer"

export function MyComponent(props) {
  return <div>{props.text}</div>
}

MyComponent.defaultProps = {
  text: "Hello World!",
}

addPropertyControls(MyComponent, {
  text: {
    type: ControlType.String,
    title: "Label Text"
  },
  // Add more controls here
})
```

**Hiding Controls:**
Use the `hidden` function in the control definition. It receives current props and returns `true` to hide.
```jsx
addPropertyControls(MyComponent, {
  showDetails: { type: ControlType.Boolean, title: "Show Details" },
  details: {
    type: ControlType.String,
    title: "Details Text",
    hidden(props) {
      return !props.showDetails; // Hide if showDetails is false
    },
  },
})
```

**Adding Descriptions:**
Use the `description` property. Supports Markdown for emphasis/links and `\n` for line breaks.
```jsx
addPropertyControls(MyComponent, {
  apiKey: {
    type: ControlType.String,
    title: "API Key",
    description: "Your *secret* API key.\nGet one [here](https://example.com).",
  },
})
```

**Available Control Types (`ControlType`):**

*   **`Array`**: For lists of values (e.g., multiple images, text inputs, component instances). Define the inner control type using `control`. Use `maxCount` to limit items.
    ```jsx
    addPropertyControls(Component, {
      items: {
        type: ControlType.Array,
        title: "List Items",
        control: { type: ControlType.String, title: "Item Text" },
        maxCount: 5,
      },
    })
    ```
*   **`Boolean`**: Checkbox (true/false). Use `enabledTitle`, `disabledTitle`.
    ```jsx
    addPropertyControls(Component, {
      isEnabled: { type: ControlType.Boolean, title: "Enable Feature", defaultValue: true },
    })
    ```
*   **`Color`**: Color picker. Value is CSS color string (rgb/rgba). `optional` prop available.
    ```jsx
    addPropertyControls(Component, {
      bgColor: { type: ControlType.Color, title: "Background", defaultValue: "#FFFFFF" },
    })
    ```
*   **`ComponentInstance`**: Link to another component/frame on the canvas. Prop value is a React node. Usually named `children`. Combine with `Array` for multiple links.
    ```jsx
    addPropertyControls(Component, {
      content: { type: ControlType.ComponentInstance, title: "Content Frame" },
    })
    ```
*   **`Date`**: Date picker. Value is an ISO 8601 string.
    ```jsx
    addPropertyControls(Component, {
      publishDate: { type: ControlType.Date, title: "Publish Date" },
    })
    ```
*   **`Enum`**: Dropdown or segmented control for a list of predefined options. Use `options` (array of values), `optionTitles` (array of display names), `displaySegmentedControl: true`.
    ```jsx
    addPropertyControls(Component, {
      alignment: {
        type: ControlType.Enum,
        title: "Alignment",
        options: ["left", "center", "right"],
        optionTitles: ["Left", "Center", "Right"],
        defaultValue: "left",
        displaySegmentedControl: true,
      },
    })
    ```
*   **`EventHandler`**: Exposes events in the Interactions panel (for Smart Components).
    ```jsx
    addPropertyControls(Component, {
      onItemClick: { type: ControlType.EventHandler },
    })
    ```
*   **`File`**: File picker. Value is a URL string. Requires `allowedFileTypes` array (e.g., `["pdf", "docx"]`).
    ```jsx
    addPropertyControls(Component, {
      document: { type: ControlType.File, title: "Document", allowedFileTypes: ["pdf"] },
    })
    ```
*   **`ResponsiveImage`**: Image picker. Value is an object `{ src, srcSet, alt }`. (Replaces deprecated `Image`).
    ```jsx
    addPropertyControls(Component, {
      heroImage: { type: ControlType.ResponsiveImage, title: "Hero Image" },
    })
    ```
*   **`Number`**: Numeric input. Can have `min`, `max`, `step`, `unit`. Use `displayStepper: true` for stepper UI.
    ```jsx
    addPropertyControls(Component, {
      opacity: { type: ControlType.Number, title: "Opacity", min: 0, max: 1, step: 0.1, defaultValue: 1 },
    })
    ```
*   **`Object`**: Group multiple controls under one object property. Can be `optional`. Define nested controls using `controls`. Use `buttonTitle`, `icon`.
    ```jsx
    addPropertyControls(Component, {
      styling: {
        type: ControlType.Object,
        title: "Styling",
        optional: true,
        controls: {
          color: { type: ControlType.Color },
          fontSize: { type: ControlType.Number, unit: "px" },
        },
      },
    })
    ```
*   **`String`**: Text input. Use `placeholder`, `maxLength`. Use `displayTextArea: true` for multi-line. Use `obscured: true` for password fields.
    ```jsx
    addPropertyControls(Component, {
      title: { type: ControlType.String, title: "Title", defaultValue: "Default Title" },
      description: { type: ControlType.String, title: "Description", displayTextArea: true },
    })
    ```
*   **`Transition`**: Framer Motion transition editor. Value is a transition object.
    ```jsx
    addPropertyControls(Component, {
      animation: { type: ControlType.Transition, title: "Animation" },
    })
    ```
*   **`Link`**: URL input field for web links.
    ```jsx
    addPropertyControls(Component, {
      learnMoreUrl: { type: ControlType.Link, title: "Learn More URL" },
    })
    ```
*   **`Padding`**: CSS padding control (single value or per-side). Value is a string (e.g., `"10px"`, `"10px 20px"`).
    ```jsx
    addPropertyControls(Component, {
      padding: { type: ControlType.Padding, title: "Padding", defaultValue: "16px" },
    })
    ```
*   **`BorderRadius`**: CSS border-radius control (single value or per-corner). Value is a string.
    ```jsx
    addPropertyControls(Component, {
      cornerRadius: { type: ControlType.BorderRadius, title: "Corner Radius", defaultValue: "8px" },
    })
    ```
*   **`Border`**: CSS border control. Value is an object containing width, style, color (can be per-side).
    ```jsx
    addPropertyControls(Component, {
      border: {
        type: ControlType.Border,
        title: "Border",
        defaultValue: { borderWidth: 1, borderStyle: "solid", borderColor: "#000" },
      },
    })
    ```
*   **`BoxShadow`**: CSS box-shadow control. Value is a valid CSS string.
    ```jsx
    addPropertyControls(Component, {
      shadow: { type: ControlType.BoxShadow, title: "Shadow" },
    })
    ```

### API Reference (`framer` library)

*   **`RenderTarget`**: Detect the rendering context.
    *   `RenderTarget.current()`: Returns the current target.
    *   Compare with `RenderTarget.canvas`, `RenderTarget.export`, `RenderTarget.thumbnail`, `RenderTarget.preview`.
    ```jsx
    import { RenderTarget } from "framer"
    if (RenderTarget.current() === RenderTarget.preview) {
      // Logic only for preview/live site
    }
    ```
*   **`useIsStaticRenderer()`**: Hook for animated components (e.g., WebGL). Returns `true` on canvas and during export to prevent performance/export issues. Use *instead* of `RenderTarget` for animations.
    ```jsx
    import { useIsStaticRenderer } from "framer"
    const isStatic = useIsStaticRenderer();
    // Conditionally disable animation if isStatic is true
    ```
*   **Localization:**
    *   `useLocaleInfo()`: Hook to get/set locale info. Returns `{ activeLocale, locales, setLocale }`.
    ```jsx
    import { useLocaleInfo } from "framer"
    const { activeLocale, locales, setLocale } = useLocaleInfo();
    // Use to build custom locale switcher
    ```
*   **`addPropertyControls(component, controls)`**: Function to add property controls (see Property Controls section).
*   **Framer Motion**: The entire `framer-motion` library is available. Import directly.
    ```jsx
    import { motion, animate } from "framer-motion"
    // Use motion components and APIs
    ```

---

## Code Overrides

### What are Code Overrides?
Small functions to modify properties or functionality of existing Framer layers.
*   Applied on the canvas but **only active in Preview and on Published sites**.
*   Must use React 18 compatible code, including `forwardRef`.

**When NOT to use Overrides (Prefer built-in features):**
*   Animating text/layers -> Use **Effects**.
*   User interactions -> Use **Components** (Smart/Code).
*   Dynamic data -> Use **Fetch**.

### Getting Started
1.  Select a layer on the canvas.
2.  In the Properties Panel, find the `Code Overrides` section.
3.  Click `+` -> `New File` (or select existing). An `Examples.tsx` file is often created by default.

### Basic Override Structure
Overrides are typically Higher-Order Components (HOCs). They receive the original component and return a new one, forwarding `props` and `ref`.
```typescript
import { forwardRef, type ComponentType } from "react"

// Override function name should be descriptive
export const withLowerOpacity = (Component): ComponentType => {
  // This part runs once when the HOC is created (rarely needed)

  // Return a new component that wraps the original
  return forwardRef((props, ref) => {
    // This part runs on every render of the layer
    // Modify props here, e.g., style
    const modifiedStyle = { ...props?.style, opacity: 0.5 };

    // Render the original component, passing the ref and *all* props (modified or original)
    return <Component ref={ref} {...props} style={modifiedStyle} />
  })
}
```
Apply the override (`withLowerOpacity` in this case) to a layer via the Properties Panel.

### Override Examples

**Custom IDs and Attributes (`withTags`)**
Add `id` or `data-*` attributes. Avoid overriding `class` or `className` directly.
```typescript
import { forwardRef, type ComponentType } from "react"

export function withTags(Component): ComponentType {
    return forwardRef((props, ref) => {
        // Add id and data attributes
        return <Component ref={ref} {...props} id="SomeID" data-framer="5678" />
    })
}
```

**Click Tracking (`withButtonTracking`)**
Execute code (e.g., API call) on click, while preserving original `onClick`.
```typescript
import { forwardRef, type ComponentType } from "react";

export function withButtonTracking(Component): ComponentType {
    return forwardRef((props, ref) => {
        const handleClick = () => {
            // Your tracking logic
            console.log("Button clicked!");
            fetch("api.example.com/tracking/button").catch(console.error);

            // Call the original onClick handler if it exists
            props?.onClick?.();
        };

        // Render original component with the wrapped onClick
        return <Component ref={ref} {...props} onClick={handleClick} />;
    });
}
```

**Dynamic Text Content (`withText`)**
Override the `text` prop of a text layer. (Consider using Fetch for data-driven text).
```typescript
import { forwardRef, type ComponentType } from "react";

export function withText(Component): ComponentType {
    return forwardRef((props, ref) => {
        // Override the text prop
        return <Component ref={ref} {...props} text="Hello World from Override" />;
    });
}
```

**Application State (Example: Simple Counter)**
Share state between components using a store (e.g., `zustand` or a simple custom store).
```typescript
import { forwardRef, type ComponentType } from "react";
// Using Framer's simple store utility
import { createStore } from "https://framer.com/m/framer/store.js@^1.0.0";

// Create a store instance
const useStore = createStore({ count: 0 });

// Override for the text layer displaying the count
export const withCount = (Component): ComponentType => {
    return forwardRef((props, ref) => {
        const [store] = useStore(); // Get state
        return <Component ref={ref} {...props} text={`${store.count}`} />;
    });
};

// Override for the button that increments the count
export const withIncrement = (Component): ComponentType => {
    return forwardRef((props, ref) => {
        const [store, setStore] = useStore(); // Get state and setter
        // Define the action on tap/click
        const onTap = () => setStore({ count: store.count + 1 });
        // Apply the onTap handler (assuming the component uses onTap prop)
        return <Component ref={ref} {...props} onTap={onTap} />;
    });
};
```
*Setup:* Create a text layer and a button. Apply `withCount` to the text layer and `withIncrement` to the button.

---

## Fetch

### What is Fetch?
Framer's built-in feature to get data from APIs and use it on your site **without code** in the component itself. Suitable for simple to complex APIs. Often requires a small backend intermediary for complex needs (auth, data shaping, CORS).

### Getting Started (Backend Setup)
*   Use Function-as-a-Service (FaaS) platforms:
    *   Cloudflare Workers (JavaScript/TypeScript)
    *   Val Town (TypeScript, Deno)
*   **Starter Templates:** Provided for Cloudflare Workers and Val Town, pre-configured with CORS.

### Returning Data
*   Backend **must** return a JSON **object**. Returning a single value directly won't work with the Path selector in Framer.
*   Supported data types in the JSON: String, Boolean, Number.
*   Special types validated by Framer: Image URLs, Colors.
*   Arrays: Cannot be directly iterated in the UI, but individual elements can be accessed by index (e.g., `data.items[0].name`).

### When to use Fetch
*   Best for data that is highly **dynamic** or **personalized** (e.g., user location, login state, live inventory, stock prices).
*   For static or manually entered info, prefer typing directly or using the Framer CMS for better optimization and SEO.

### Fetch Backend Examples

**Simple Backend (Random Greeting):**
Returns a simple JSON object. Works in Cloudflare Workers, Val Town, etc. (Needs CORS headers added).
```javascript
// Example for Cloudflare Worker / similar environment
function handleRequest(request) {
  const greetings = ["Hello!", "Welcome!", "Hi!", "Heya!", "Hoi!"];
  const index = Math.floor(Math.random() * greetings.length);

  const data = { message: greetings[index] };

  // --- IMPORTANT: Add CORS Headers ---
  const headers = new Headers({
    'Access-Control-Allow-Origin': '*', // Adjust for production
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  });
  // -----------------------------------

  return new Response(JSON.stringify(data), { headers });
}

// Event listener depends on the platform (e.g., addEventListener('fetch', ...))
```

**API Wrapper:**
Fetch data from another API, process it, and return. Useful for hiding API keys or simplifying data.
```javascript
// Example for Cloudflare Worker / similar environment
async function handleRequest(request) {
  try {
    // Fetch data from an external API
    const apiResponse = await fetch("https://api.example.com/status");
    if (!apiResponse.ok) throw new Error("API request failed");
    const statusData = await apiResponse.json();

    // Optional: Adjust, filter, or manipulate the data
    const processedData = { currentStatus: statusData.status, timestamp: new Date().toISOString() };

    // --- CORS Headers ---
    const headers = new Headers({ /* ... CORS headers as above ... */ });

    return new Response(JSON.stringify(processedData), { headers });

  } catch (error) {
    // --- CORS Headers (even for errors) ---
    const headers = new Headers({ /* ... CORS headers as above ... */ });
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers });
  }
}
```

**Configuring CORS:**
Cross-Origin Resource Sharing (CORS) headers are required for Fetch to work from the editor and published sites. The backend needs to send these headers.
```javascript
// Basic CORS Headers (add to your Response)
const headers = new Headers();
// Allow requests from any origin (restrict in production!)
headers.set('Access-Control-Allow-Origin', '*');
// Allow only GET requests (adjust if needed)
headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
// Allow standard headers
headers.set('Access-Control-Allow-Headers', 'Content-Type');
// Set response content type
headers.set('Content-Type', 'application/json');

// Use these headers in your `new Response(...)`
// return new Response(JSON.stringify(data), { headers });
```
*   **Note:** For production, replace `'*'` with your specific Framer site domain(s). Many backend frameworks/platforms (like Hono, Vercel) have helpers for CORS.

**Authentication: Token Example (API Key)**
Safely use an API key by storing it as an environment variable in your backend service (e.g., Cloudflare Worker Secrets).
```javascript
// Example for Cloudflare Worker with environment variable IPINFO_TOKEN
async function handleRequest(request, env) {
  // Get client IP (method depends on platform)
  const clientIP = request.headers.get('CF-Connecting-IP');
  if (!clientIP) return new Response('Could not determine IP', { status: 400 });

  // Get token from environment variable
  const IPinfoToken = env.IPINFO_TOKEN;
  if (!IPinfoToken) return new Response('API token not configured', { status: 500 });

  const locationURL = new URL(`https://ipinfo.io/${clientIP}`);
  locationURL.searchParams.set("token", IPinfoToken);

  try {
    const locationResponse = await fetch(locationURL.href);
    const locationData = await locationResponse.json();

    // --- CORS Headers ---
    const headers = new Headers({ /* ... CORS headers ... */ });

    return new Response(JSON.stringify(locationData), { headers });
  } catch (error) {
     // --- CORS Headers ---
    const headers = new Headers({ /* ... CORS headers ... */ });
    return new Response(JSON.stringify({ error: 'Failed to fetch location' }), { status: 500, headers });
  }
}
```

**Using Hono (Example Backend Framework):**
Hono is a small web framework that simplifies routing and middleware like CORS.
```javascript
// Example using Hono in a Cloudflare Worker
import { Hono } from 'hono'
import { cors } from 'hono/cors'

const app = new Hono()

// Apply CORS middleware to all routes
app.use('*', cors({
  origin: '*', // Configure allowed origins
}));

// Define a simple root route
app.get('/', (c) => {
  return c.json({ message: 'Hello from Hono!' });
});

// Define another route, e.g., fetching weather data
app.get('/weather', async (c) => {
  try {
    // Replace with actual weather API call
    // const weatherData = await fetch("https://api.weather.com/...").then(res => res.json());
    const mockWeatherData = { city: "Amsterdam", temp: 15, condition: "Cloudy" };

    return c.json(mockWeatherData);
  } catch (error) {
    return c.json({ error: 'Failed to fetch weather' }, 500);
  }
});

// Export the app instance (for Cloudflare Workers)
export default app
