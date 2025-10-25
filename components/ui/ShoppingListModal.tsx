'use client';

import { generateShoppingListAction } from '@/app/actions';
import { Button } from '@/components/ui/button';
import Modal from '@/components/ui/Modal';
import { DialogTitle } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import { Check, Copy, Loader2, ShoppingCart } from 'lucide-react';
import React, { Dispatch, SetStateAction, useState } from 'react';

interface ShoppingListItem {
  name: string;
  quantity: string;
  unit: string;
  recipes: string[];
  category: string;
}

interface ShoppingListData {
  shoppingList: ShoppingListItem[];
  weekStart: string;
  weekEnd: string;
  totalRecipes: number;
}

interface ShoppingListModalProps {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  weekStart: Date;
  weekEnd: Date;
}

export default function ShoppingListModal({
  open,
  setOpen,
  weekStart,
  weekEnd,
}: ShoppingListModalProps) {
  const [loading, setLoading] = useState(false);
  const [shoppingListData, setShoppingListData] =
    useState<ShoppingListData | null>(null);
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
  const [copied, setCopied] = useState(false);

  const generateShoppingList = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('weekStart', format(weekStart, 'yyyy-MM-dd'));
      formData.append('weekEnd', format(weekEnd, 'yyyy-MM-dd'));

      const result = await generateShoppingListAction(formData);

      if (result.success && result.data) {
        setShoppingListData(result.data);
      } else {
        alert(result.message || 'Failed to generate shopping list');
      }
    } catch (error) {
      console.error('Error generating shopping list:', error);
      alert('Failed to generate shopping list');
    } finally {
      setLoading(false);
    }
  };

  const toggleItem = (itemName: string) => {
    const newCheckedItems = new Set(checkedItems);
    if (newCheckedItems.has(itemName)) {
      newCheckedItems.delete(itemName);
    } else {
      newCheckedItems.add(itemName);
    }
    setCheckedItems(newCheckedItems);
  };

  const copyToClipboard = async () => {
    if (!shoppingListData) return;

    const categories = Array.from(
      new Set(shoppingListData.shoppingList.map((item) => item.category))
    );
    let text = `Shopping List for ${format(new Date(shoppingListData.weekStart), 'MMM d')} - ${format(new Date(shoppingListData.weekEnd), 'MMM d, yyyy')}\n\n`;

    categories.forEach((category) => {
      const categoryItems = shoppingListData.shoppingList.filter(
        (item) => item.category === category
      );
      if (categoryItems.length > 0) {
        text += `${category}:\n`;
        categoryItems.forEach((item) => {
          const quantityText = item.quantity
            ? `${item.quantity}${item.unit ? ' ' + item.unit : ''} `
            : '';
          text += `• ${quantityText}${item.name}\n`;
        });
        text += '\n';
      }
    });

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setShoppingListData(null);
    setCheckedItems(new Set());
    setCopied(false);
  };

  // Generate shopping list when modal opens
  React.useEffect(() => {
    if (open && !shoppingListData && !loading) {
      generateShoppingList();
    }
  }, [open]);

  return (
    <Modal open={open} setOpen={setOpen} height="h-[85vh]">
      <div className="mt-3 text-center sm:mt-0 sm:text-left w-auto">
        <DialogTitle
          as="h3"
          className="text-xl font-semibold leading-6 text-gray-900 mb-3 flex items-center justify-between text-left gap-4"
        >
          <div className="flex items-center gap-3">
            <ShoppingCart className="h-6 w-6 text-primary" />
            <div>
              <span>Shopping List</span>
              <p className="text-sm text-gray-500 font-normal">
                {format(weekStart, 'MMM d')} - {format(weekEnd, 'MMM d, yyyy')}
              </p>
            </div>
          </div>
          <XMarkIcon
            onClick={handleClose}
            className="h-6 w-6 text-primary cursor-pointer"
          />
        </DialogTitle>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(85vh-200px)]">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center gap-3">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <span className="text-gray-500">
                  Generating shopping list...
                </span>
              </div>
            </div>
          ) : shoppingListData ? (
            <div className="space-y-6">
              {/* Summary */}
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">
                  Shopping list for {shoppingListData.totalRecipes} recipes with{' '}
                  {shoppingListData.shoppingList.length} ingredients
                </p>
              </div>

              {/* Shopping List by Category */}
              {Array.from(
                new Set(
                  shoppingListData.shoppingList.map((item) => item.category)
                )
              ).map((category) => {
                const categoryItems = shoppingListData.shoppingList.filter(
                  (item) => item.category === category
                );

                return (
                  <div key={category} className="space-y-3">
                    <h3 className="font-semibold text-gray-900 text-lg border-b pb-2">
                      {category}
                    </h3>
                    <div className="space-y-2">
                      {categoryItems.map((item, index) => (
                        <div
                          key={`${category}-${index}`}
                          className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                            checkedItems.has(item.name)
                              ? 'bg-gray-50 text-gray-500 line-through'
                              : 'bg-white hover:bg-gray-50'
                          }`}
                          onClick={() => toggleItem(item.name)}
                        >
                          <div className="flex-shrink-0 mt-0.5">
                            {checkedItems.has(item.name) ? (
                              <Check className="h-4 w-4 text-primary" />
                            ) : (
                              <div className="h-4 w-4 border border-gray-400 rounded"></div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">
                                {item.quantity && (
                                  <span className="text-primary">
                                    {item.quantity}
                                    {item.unit && ` ${item.unit}`}{' '}
                                  </span>
                                )}
                                {item.name}
                              </span>
                            </div>
                            {item.recipes.length > 0 && (
                              <p className="text-xs text-gray-500 mt-1">
                                For: {item.recipes.join(', ')}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">Failed to generate shopping list</p>
            </div>
          )}
        </div>

        {/* Footer */}
        {shoppingListData && (
          <div className="flex items-center justify-between pt-6 border-t mt-6">
            <div className="text-sm text-gray-500">
              {checkedItems.size} of {shoppingListData.shoppingList.length}{' '}
              items checked
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={copyToClipboard}
                className="flex items-center gap-2"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    Copy List
                  </>
                )}
              </Button>
              <Button onClick={handleClose}>Done</Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
