\# Product Frame Generator



\[Live Demo](https://framegen.sgx.sentrasoft.co.id)



An application to create promotional images with a title and a grid of products. Users can manage groups of products, upload images, and generate a downloadable PNG frame showcasing active products. All data is saved locally in the browser, ensuring privacy and offline functionality.



\## Features



\*   \*\*Group Management:\*\* Create, rename, and delete groups to organize your products.

\*   \*\*Product Management:\*\* Add products with custom names and images to your groups.

\*   \*\*Image Upload:\*\* Upload product images directly from your device.

\*   \*\*Product Activation:\*\* Easily toggle which products are active and should appear in the final generated image.

\*   \*\*Customizable Backgrounds:\*\* Set a solid color or upload a custom image as the background for your frame.

\*   \*\*Powerful Theme Engine:\*\*

&nbsp;   \*   Choose from a set of pre-defined themes.

&nbsp;   \*   Create your own custom themes with the built-in theme editor.

&nbsp;   \*   Customize background color, title font (family, size, weight, style), title color, caption font, caption color, and shadow effects.

\*   \*\*Client-Side Image Generation:\*\* Generates the final promotional frame as a high-quality PNG file directly in your browser using the HTML Canvas API.

\*   \*\*Downloadable Output:\*\* Preview and download the generated image.

\*   \*\*100% Offline Functionality:\*\* All data, including groups and images, is stored locally in your browser's `localStorage` and `IndexedDB`. No internet connection is needed after the initial page load.



\## How It Works



This application is built to run entirely on the client-side, meaning there is no backend server involved.



\*   \*\*Data Persistence:\*\* Product groups and theme settings are saved in your browser's `localStorage`.

\*   \*\*Image Storage:\*\* Uploaded images are efficiently stored in `IndexedDB`, allowing for larger storage capacity than `localStorage`.

\*   \*\*Image Rendering:\*\* The final promotional image is dynamically drawn onto an HTML `<canvas>` element and then converted into a data URL for previewing and downloading as a PNG file.



\## Tech Stack



\*   \*\*React:\*\* For building the user interface.

\*   \*\*TypeScript:\*\* For type safety and improved developer experience.

\*   \*\*Tailwind CSS:\*\* For styling the application.

\*   \*\*IndexedDB:\*\* For client-side storage of images.

\*   \*\*HTML Canvas API:\*\* For generating the final image.



