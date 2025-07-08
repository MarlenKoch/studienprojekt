import React, { useEffect } from "react";
import styles from "./Header.module.css"


const SearchBar: React.FC = () => {
  
  useEffect(() => {
  
    }
  )

  return (
    <div className={styles.searchBar}>
      <div className={styles.searchContainer}>
        <input
          type="text"
          
          placeholder="Nach Rezepten suchen ..."
          
        />
        {/* {searchResults.length > 0 && (
          <ul className="search-results">
            {searchResults.map((recipe) => (
              <li key={recipe.id} onClick={() => handleResultClick(recipe.id)}>
                {recipe.name}
              </li>
            ))}
          </ul>
        )} */}
      </div>
    </div>
  );
};

export default SearchBar;