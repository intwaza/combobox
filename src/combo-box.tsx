import { useState, useRef, useEffect, KeyboardEvent } from "react";
import { dropdownData, DropdownData } from "./data";

interface ComboBoxProps {
  placeholder?: string;
  multiSelect?: boolean;
}

export const ComboBox = ({ 
  placeholder = "Select an option...", 
  multiSelect = false
}: ComboBoxProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [selectedOptions, setSelectedOptions] = useState<DropdownData[]>([]);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const listboxRef = useRef<HTMLUListElement>(null);
  const comboboxRef = useRef<HTMLDivElement>(null);

  // Filter options based on input
  const filteredOptions = dropdownData.filter((option) =>
    option.label.toLowerCase().includes(inputValue.toLowerCase()) && 
    (!multiSelect || !selectedOptions.some(selected => selected.value === option.value))
  );

  // Handle selection
  const handleSelect = (option: DropdownData) => {
    if (multiSelect) {
      const newSelectedOptions = [...selectedOptions, option];
      setSelectedOptions(newSelectedOptions);
      setInputValue("");
      
    } 
    else {
      setSelectedOptions([option]);
      setInputValue(option.label);
      setIsOpen(false);
    }
    
    inputRef.current?.focus();
  };

  // Remove a selected tag
  const removeTag = (optionToRemove: DropdownData, e: React.MouseEvent) => {
    e.stopPropagation();
    const newSelectedOptions = selectedOptions.filter(
      option => option.value !== optionToRemove.value
    );
    setSelectedOptions(newSelectedOptions);
  };

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    if (!multiSelect) {
      setSelectedOptions([]);
    }
    setIsOpen(true);
    setHighlightedIndex(-1);
  };

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (comboboxRef.current && !comboboxRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen && e.key !== "Escape" && e.key !== "Tab") {
      setIsOpen(true);
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prevIndex) => {
          const newIndex = prevIndex < filteredOptions.length - 1 ? prevIndex + 1 : 0;
          scrollIntoView(newIndex);
          return newIndex;
        });
        break;

      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prevIndex) => {
          const newIndex = prevIndex > 0 ? prevIndex - 1 : filteredOptions.length - 1;
          scrollIntoView(newIndex);
          return newIndex;
        });
        break;

      case "Enter":
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < filteredOptions.length) {
          handleSelect(filteredOptions[highlightedIndex]);
        }
        break;

      case "Escape":
        e.preventDefault();
        setIsOpen(false);
        break;

      case "Backspace":
        if (multiSelect && inputValue === "" && selectedOptions.length > 0) {
          e.preventDefault();
          const newSelectedOptions = [...selectedOptions];
          newSelectedOptions.pop();
          setSelectedOptions(newSelectedOptions);
        }
        break;

      default:
        break;
    }
  };

  // Scroll highlighted option into view
  const scrollIntoView = (index: number) => {
    const element = listboxRef.current?.children[index] as HTMLElement;
    if (element) {
      element.scrollIntoView({ block: "nearest" });
    }
  };

  // Toggle dropdown
  const toggleDropdown = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      inputRef.current?.focus();
    }
  };

  return (
    <div className="combobox-container" ref={comboboxRef}>
      <div 
        className={`combobox-input-wrapper ${isOpen ? 'active' : ''} ${multiSelect ? 'multi-select' : ''}`}
        onClick={toggleDropdown}
      >
        {multiSelect && selectedOptions.length > 0 && (
          <div className="selected-tags">
            {selectedOptions.map((option) => (
              <div key={option.value} className="selected-tag">
                <span>{option.label}</span>
                <button 
                  className="tag-remove-btn"
                  onClick={(e) => removeTag(option, e)}
                  aria-label={`Remove ${option.label}`}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6L6 18M6 6l12 12"/>
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
        
        <input
          ref={inputRef}
          type="text"
          className={`combobox-input ${multiSelect && selectedOptions.length > 0 ? 'with-tags' : ''}`}
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={selectedOptions.length > 0 ? "" : placeholder}
          aria-controls="combobox-listbox"
          aria-expanded={isOpen}
          aria-autocomplete="list"
          role="combobox"
        />
        <div className="combobox-arrow">
          <svg 
            width="16" 
            height="16" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <path d="m6 9 6 6 6-6"/>
          </svg>
        </div>
      </div>
      
      {isOpen && (
        <ul
          id="combobox-listbox"
          ref={listboxRef}
          className="combobox-listbox"
          role="listbox"
        >
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option, index) => (
              <li
                key={option.value}
                role="option"
                className={`combobox-option ${
                  highlightedIndex === index ? "highlighted" : ""
                }`}
                onClick={() => handleSelect(option)}
                aria-selected={highlightedIndex === index}
              >
                {option.label}
              </li>
            ))
          ) : (
            <li className="combobox-no-results">No results found</li>
          )}
        </ul>
      )}
    </div>
  );
};