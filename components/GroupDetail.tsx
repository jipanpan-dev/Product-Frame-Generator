import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Group, Product, Background } from '../types';
import Modal from './Modal';
import { renderFrameToDataURL } from '../services/imageGenerator';
import { ArrowLeftIcon, PlusIcon, TrashIcon, PencilIcon, ImageIcon, UploadIcon, PhotoIcon, PaletteIcon } from './icons';
import ConfirmModal from './ConfirmModal';
import { useThemes } from '../hooks/useThemes';
import ThemeSelectorModal from './ThemeSelectorModal';
import * as db from '../services/db';
import { useImage } from '../hooks/useImage';

interface GroupDetailProps {
  group: Group;
  onGroupUpdate: (group: Group) => void;
  onDeleteGroup: () => void;
  onBack: () => void;
}

// ProductCard Component defined in the same file to avoid prop-drilling issues
// and because it's only used within GroupDetail.
interface ProductCardProps {
    product: Product;
    onToggleActive: () => void;
    onRename: () => void;
    onReplaceImage: () => void;
    onDelete: () => void;
}
const ProductCard: React.FC<ProductCardProps> = ({ product, onToggleActive, onRename, onReplaceImage, onDelete }) => {
    const { imageUrl, isLoading } = useImage(product.imageId);

    return (
        <div className="bg-slate-800 rounded-lg overflow-hidden border border-slate-700 shadow-lg flex flex-col">
            <div className="relative aspect-square bg-slate-700">
                {isLoading ? (
                    <div className="w-full h-full flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-400"></div>
                    </div>
                ) : imageUrl ? (
                    <img src={imageUrl} alt={product.name} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-500">
                        <ImageIcon className="w-16 h-16" />
                    </div>
                )}
                <div 
                    className={`absolute top-2 right-2 px-2 py-1 text-xs font-bold rounded-full text-white ${product.isActive ? 'bg-green-500' : 'bg-slate-600'}`}>
                    {product.isActive ? 'ACTIVE' : 'INACTIVE'}
                </div>
            </div>
            <div className="p-4 flex-grow flex flex-col">
                <h4 className="font-bold text-lg text-slate-200 truncate flex-grow">{product.name}</h4>
                <div className="flex items-center justify-between mt-4">
                    <button onClick={onToggleActive} className={`px-3 py-1 text-sm rounded-md transition-colors ${product.isActive ? 'bg-yellow-600 hover:bg-yellow-500' : 'bg-green-600 hover:bg-green-500'} text-white`}>
                        {product.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                    <div className="flex items-center gap-1">
                        <button onClick={onRename} className="p-2 text-slate-400 hover:text-sky-400 hover:bg-slate-700 rounded-full transition-colors"><PencilIcon /></button>
                        <button onClick={onReplaceImage} className="p-2 text-slate-400 hover:text-sky-400 hover:bg-slate-700 rounded-full transition-colors"><ImageIcon /></button>
                        <button onClick={onDelete} className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-700 rounded-full transition-colors"><TrashIcon /></button>
                    </div>
                </div>
            </div>
        </div>
    );
};


const GroupDetail: React.FC<GroupDetailProps> = ({ group, onGroupUpdate, onDeleteGroup, onBack }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [isBgModalOpen, setIsBgModalOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);

  const { getThemeById } = useThemes();

  const [productToEdit, setProductToEdit] = useState<Product | null>(null);
  const [newProductName, setNewProductName] = useState('');
  
  const [newProductFile, setNewProductFile] = useState<File | null>(null);
  const [newProductNameInput, setNewProductNameInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const replaceFileInputRef = useRef<HTMLInputElement>(null);

  const [bgTab, setBgTab] = useState<'color' | 'image'>('color');
  const [bgColor, setBgColor] = useState('#1e293b');
  const [bgImage, setBgImage] = useState<string | null>(null); // Holds base64 for preview
  const [isNewBgImage, setIsNewBgImage] = useState(false);
  const bgFileInputRef = useRef<HTMLInputElement>(null);
  
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  const activeProductCount = group.products.filter(p => p.isActive).length;

  const currentBgImageId = group.background?.type === 'image' ? group.background.imageId : null;
  const { imageUrl: currentBgImageUrl } = useImage(currentBgImageId);

  useEffect(() => {
    if (isBgModalOpen) {
      setIsNewBgImage(false);
      if (group.background?.type === 'image') {
        setBgTab('image');
        setBgImage(currentBgImageUrl);
        setBgColor('#1e293b');
      } else if (group.background?.type === 'color') {
        setBgTab('color');
        setBgColor(group.background.value);
        setBgImage(null);
      } else {
        setBgTab('color');
        setBgColor('#1e293b');
        setBgImage(null);
      }
    }
  }, [isBgModalOpen, group.background, currentBgImageUrl]);

  const handleUpdate = useCallback((updatedGroup: Partial<Group>) => {
    onGroupUpdate({ ...group, ...updatedGroup });
  }, [group, onGroupUpdate]);

  const addProduct = async () => {
    if (!newProductFile || !newProductNameInput.trim()) {
      alert("Please provide a product name and image file.");
      return;
    }
    const reader = new FileReader();
    reader.readAsDataURL(newProductFile);
    reader.onload = async () => {
      try {
        const imageId = await db.addImage(reader.result as string);
        const newProduct: Product = {
          id: Date.now().toString(),
          name: newProductNameInput.trim(),
          imageId: imageId,
          isActive: true,
        };
        handleUpdate({ products: [...group.products, newProduct] });
        setNewProductFile(null);
        setNewProductNameInput('');
        if (fileInputRef.current) fileInputRef.current.value = '';
      } catch (error) {
        console.error("Failed to save image to DB", error);
        alert("Failed to save product image. Please try again.");
      }
    };
  };

  const requestDeleteProduct = (product: Product) => {
    setProductToDelete(product);
  };

  const confirmDeleteProduct = async () => {
    if (productToDelete) {
      try {
        await db.deleteImage(productToDelete.imageId);
        handleUpdate({ products: group.products.filter(p => p.id !== productToDelete.id) });
        setProductToDelete(null);
      } catch (error) {
        console.error("Failed to delete product image", error);
        alert("Failed to delete product image. Please try again.");
      }
    }
  };

  const toggleProductActive = (productId: string) => {
    const updatedProducts = group.products.map(p => p.id === productId ? { ...p, isActive: !p.isActive } : p);
    handleUpdate({ products: updatedProducts });
  };

  const openRenameModal = (product: Product) => {
    setProductToEdit(product);
    setNewProductName(product.name);
    setIsRenameModalOpen(true);
  };
  
  const handleRenameProduct = () => {
      if(productToEdit && newProductName.trim()){
          const updatedProducts = group.products.map(p => p.id === productToEdit.id ? {...p, name: newProductName.trim()} : p);
          handleUpdate({ products: updatedProducts });
          setIsRenameModalOpen(false);
          setProductToEdit(null);
      }
  };

  const handleReplaceImage = (product: Product) => {
    setProductToEdit(product);
    replaceFileInputRef.current?.click();
  };

  const onReplaceFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && productToEdit) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        try {
          const newImageId = await db.addImage(reader.result as string);
          await db.deleteImage(productToEdit.imageId); // Delete old image
          const updatedProducts = group.products.map(p => p.id === productToEdit.id ? {...p, imageId: newImageId} : p);
          handleUpdate({ products: updatedProducts });
          setProductToEdit(null);
        } catch (error) {
            console.error("Failed to replace image", error);
            alert("Failed to replace image. Please try again.");
        }
      };
    }
    e.target.value = ''; // Reset input
  };

  const handleBgFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        setBgImage(reader.result as string);
        setIsNewBgImage(true);
      };
      e.target.value = '';
    }
  };

  const handleSaveBackground = async () => {
    let newBackground: Background | undefined = group.background;
    try {
        if (bgTab === 'color') {
            if (group.background?.type === 'image') {
                await db.deleteImage(group.background.imageId);
            }
            newBackground = { type: 'color', value: bgColor };
        } else if (bgTab === 'image' && bgImage && isNewBgImage) {
            const newImageId = await db.addImage(bgImage);
            if (group.background?.type === 'image') {
                await db.deleteImage(group.background.imageId);
            }
            newBackground = { type: 'image', imageId: newImageId };
        }
        handleUpdate({ background: newBackground });
        setIsBgModalOpen(false);
    } catch(error) {
        console.error("Failed to save background", error);
        alert("Failed to save background. Please try again.");
    }
  };

  const handleRemoveBackground = async () => {
    try {
        if (group.background?.type === 'image') {
            await db.deleteImage(group.background.imageId);
        }
        const { background, ...groupWithoutBg } = group;
        onGroupUpdate(groupWithoutBg); // Must use onGroupUpdate to remove property
        setIsBgModalOpen(false);
    } catch (error) {
        console.error("Failed to remove background", error);
        alert("Failed to remove background. Please try again.");
    }
  };
  
  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const theme = getThemeById(group.themeId);
      const dataUrl = await renderFrameToDataURL(group, theme);
      if (dataUrl) {
        setPreviewImageUrl(dataUrl);
        setIsPreviewModalOpen(true);
      } else {
        alert("Could not generate image: No active products found.");
      }
    } catch (error) {
      console.error("Image generation failed:", error);
      alert("Something went wrong during image generation.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!previewImageUrl) return;
    const link = document.createElement('a');
    const today = new Date().toISOString().slice(0, 10);
    link.download = `${group.name}-${today}.png`;
    link.href = previewImageUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setIsPreviewModalOpen(false);
  };
  
  const handleThemeSelect = (themeId: string) => {
    handleUpdate({ themeId });
  };

  const currentThemeName = getThemeById(group.themeId).name;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
            <button onClick={onBack} className="flex items-center gap-2 text-sky-400 hover:text-sky-300 mb-2 transition-colors">
                <ArrowLeftIcon />
                Back to Groups
            </button>
            <h2 className="text-4xl font-bold text-slate-100">{group.name}</h2>
            <div className="flex items-center gap-4 mt-2">
                <p className="text-slate-400">{group.products.length} products total / {activeProductCount} active</p>
                <div className="w-px h-4 bg-slate-600"></div>
                <p className="text-slate-400">Theme: <span className="font-semibold text-slate-300">{currentThemeName}</span></p>
            </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap justify-start md:justify-end">
             <button
                onClick={() => setIsThemeModalOpen(true)}
                className="flex items-center gap-2 bg-slate-600 hover:bg-slate-500 text-white font-bold py-3 px-5 rounded-lg transition-colors shadow-lg"
            >
              <PaletteIcon /> Select Theme
            </button>
            <button
                onClick={() => setIsBgModalOpen(true)}
                className="flex items-center gap-2 bg-slate-600 hover:bg-slate-500 text-white font-bold py-3 px-5 rounded-lg transition-colors shadow-lg"
            >
              <PhotoIcon /> Set Background
            </button>
             <button
              onClick={onDeleteGroup}
              className="flex items-center gap-2 bg-red-800 hover:bg-red-700 text-white font-bold py-3 px-5 rounded-lg transition-colors shadow-lg"
            >
              <TrashIcon /> Delete Group
            </button>
            <button
              onClick={handleGenerate}
              disabled={isGenerating || activeProductCount === 0}
              className="flex items-center gap-2 bg-sky-600 hover:bg-sky-500 text-white font-bold py-3 px-5 rounded-lg transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? 'Generating...' : 'Generate Image'}
            </button>
        </div>
      </div>
      
      <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
        <h3 className="text-xl font-semibold mb-4 text-sky-300">Add New Product</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
                type="text"
                value={newProductNameInput}
                onChange={(e) => setNewProductNameInput(e.target.value)}
                placeholder="Product Name / Caption"
                className="w-full bg-slate-900 border border-slate-600 rounded-md p-3 text-white focus:outline-none focus:ring-2 focus:ring-sky-500 md:col-span-1"
            />
            <input
                type="file"
                ref={fileInputRef}
                onChange={(e) => setNewProductFile(e.target.files?.[0] || null)}
                accept="image/png, image/jpeg, image/webp"
                className="w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-sky-900 file:text-sky-300 hover:file:bg-sky-800 md:col-span-1"
            />
            <button
                onClick={addProduct}
                disabled={!newProductNameInput.trim() || !newProductFile}
                className="w-full flex items-center justify-center gap-2 bg-slate-600 hover:bg-slate-500 text-white font-bold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 md:col-span-1"
            >
                <PlusIcon /> Add Product
            </button>
        </div>
      </div>

      {group.products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {group.products.map(product => (
            <ProductCard 
                key={product.id} 
                product={product} 
                onToggleActive={() => toggleProductActive(product.id)}
                onRename={() => openRenameModal(product)}
                onReplaceImage={() => handleReplaceImage(product)}
                onDelete={() => requestDeleteProduct(product)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 px-6 bg-slate-800 rounded-lg border border-dashed border-slate-700">
          <h3 className="text-xl font-semibold text-slate-300">No Products Yet</h3>
          <p className="text-slate-400 mt-2">Add your first product using the form above.</p>
        </div>
      )}

       <input
        type="file"
        ref={replaceFileInputRef}
        onChange={onReplaceFileSelected}
        accept="image/png, image/jpeg, image/webp"
        className="hidden"
      />
      <input
        type="file"
        ref={bgFileInputRef}
        onChange={handleBgFileChange}
        accept="image/png, image/jpeg, image/webp"
        className="hidden"
      />

      <Modal isOpen={isRenameModalOpen} onClose={() => setIsRenameModalOpen(false)} title="Rename Product">
         <div className="space-y-4">
          <input
            type="text"
            value={newProductName}
            onChange={(e) => setNewProductName(e.target.value)}
            placeholder="Enter new product name"
            className="w-full bg-slate-900 border border-slate-600 rounded-md p-3 text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
            autoFocus
          />
          <button
            onClick={handleRenameProduct}
            className="w-full bg-sky-600 hover:bg-sky-500 text-white font-bold py-3 px-4 rounded-lg transition-colors disabled:opacity-50"
            disabled={!newProductName.trim()}
          >
            Save Name
          </button>
        </div>
      </Modal>

      <Modal isOpen={isBgModalOpen} onClose={() => setIsBgModalOpen(false)} title="Set Group Background">
        <div className="space-y-4">
            <div className="flex border-b border-slate-600">
                <button onClick={() => setBgTab('color')} className={`px-4 py-2 text-sm font-medium ${bgTab === 'color' ? 'border-b-2 border-sky-400 text-sky-400' : 'text-slate-400'}`}>Color</button>
                <button onClick={() => setBgTab('image')} className={`px-4 py-2 text-sm font-medium ${bgTab === 'image' ? 'border-b-2 border-sky-400 text-sky-400' : 'text-slate-400'}`}>Image</button>
            </div>
            {bgTab === 'color' && (
                <div className="flex items-center gap-4 p-4 bg-slate-900/50 rounded-lg">
                    <label htmlFor="bgColor" className="font-semibold text-slate-300">Choose a color:</label>
                    <input type="color" id="bgColor" value={bgColor} onChange={e => setBgColor(e.target.value)} className="w-16 h-10 p-1 bg-slate-800 border border-slate-600 rounded cursor-pointer"/>
                </div>
            )}
            {bgTab === 'image' && (
                <div className="p-4 bg-slate-900/50 rounded-lg text-center">
                    <button onClick={() => bgFileInputRef.current?.click()} className="flex items-center justify-center w-full gap-2 bg-slate-600 hover:bg-slate-500 text-white font-bold py-3 px-4 rounded-lg transition-colors">
                        <UploadIcon /> Upload Image
                    </button>
                    {bgImage && <img src={bgImage} alt="Background preview" className="mt-4 rounded-md object-contain max-h-48 mx-auto"/>}
                </div>
            )}

            <div className="pt-2">
                <p className="text-sm font-semibold text-slate-400 mb-2">Live Preview</p>
                <div
                    className="w-full h-36 rounded-lg border-2 border-slate-600 flex items-center justify-center bg-cover bg-center transition-all duration-300"
                    style={{
                        backgroundColor: bgTab === 'color' ? bgColor : '#111827',
                        backgroundImage: bgTab === 'image' && bgImage ? `url(${bgImage})` : 'none',
                    }}
                    aria-label="Background preview"
                >
                    <span className="text-white font-bold text-2xl" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}>
                        {group.name}
                    </span>
                </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-slate-700">
                <button onClick={handleRemoveBackground} className="text-red-500 hover:text-red-400 font-semibold px-4 py-2 rounded-lg hover:bg-red-500/10 transition-colors">
                    Remove Background
                </button>
                <button onClick={handleSaveBackground} className="bg-sky-600 hover:bg-sky-500 text-white font-bold py-2 px-6 rounded-lg transition-colors">
                    Save
                </button>
            </div>
        </div>
      </Modal>

      <Modal size="5xl" isOpen={isPreviewModalOpen} onClose={() => setIsPreviewModalOpen(false)} title="Generated Image Preview">
        <div className="space-y-4">
            {previewImageUrl && (
                <img src={previewImageUrl} alt="Generated Frame Preview" className="w-full h-auto rounded-lg border border-slate-600 bg-slate-900" />
            )}
            <div className="flex justify-end gap-4 pt-4 border-t border-slate-700">
                <button
                    onClick={() => setIsPreviewModalOpen(false)}
                    className="bg-slate-600 hover:bg-slate-500 text-white font-bold py-2 px-6 rounded-lg transition-colors"
                >
                    Close
                </button>
                <button
                    onClick={handleDownload}
                    className="bg-sky-600 hover:bg-sky-500 text-white font-bold py-2 px-6 rounded-lg transition-colors"
                >
                    Download Image
                </button>
            </div>
        </div>
      </Modal>

      <ConfirmModal
        isOpen={!!productToDelete}
        onClose={() => setProductToDelete(null)}
        onConfirm={confirmDeleteProduct}
        title="Delete Product"
        message={`Are you sure you want to delete the product "${productToDelete?.name}"? This action cannot be undone.`}
      />

      <ThemeSelectorModal 
        isOpen={isThemeModalOpen}
        onClose={() => setIsThemeModalOpen(false)}
        onSelectTheme={handleThemeSelect}
        activeThemeId={group.themeId}
      />
    </div>
  );
};

export default GroupDetail;
