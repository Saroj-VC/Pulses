(function() {
    var searchQuery = document.getElementById('search-query');
    var searchResults = document.getElementById('search-results');
    var lunrIndex, pagesIndex;

    function initLunr() {
        // Fetch the prebuilt search index (index.json)
        fetch('/index.json')
            .then(response => response.json())
            .then(data => {
                pagesIndex = data; // Store all pages data
                lunrIndex = lunr(function () {
                    // Define the fields to search in
                    this.field('title');
                    this.field('content');
                    this.field('permalink');
                    this.field('description'); // Also search in descriptions

                    // Add each page to the search index
                    pagesIndex.forEach(function (page, i) {
                        this.add(page);
                    }, this);
                });
            })
            .catch(error => {
                console.error('Error fetching search index:', error);
                searchResults.innerHTML = '<p>Error loading search. Please try again later.</p>';
            });
    }

    function search(query) {
        if (!lunrIndex) {
            searchResults.innerHTML = '<p>Search is loading... please wait a moment.</p>';
            return;
        }
        if (query.length < 2) { // Require at least 2 characters to start searching
            searchResults.innerHTML = '<p>Type at least 2 characters to search.</p>';
            return;
        }

        var results = lunrIndex.search(query); // Perform the search
        renderResults(results);
    }

    function renderResults(results) {
        searchResults.innerHTML = ''; // Clear previous results
        if (results.length === 0) {
            searchResults.innerHTML = '<p>No results found for your query.</p>';
            return;
        }

        var ul = document.createElement('ul');
        ul.className = 'search-results-list'; // Add a class for styling (optional)
        results.forEach(function(result) {
            var li = document.createElement('li');
            li.className = 'search-result-item'; // Add a class for styling (optional)
            var page = pagesIndex.find(p => p.ref === result.ref); // Find the full page data

            if (page) {
                var a = document.createElement('a');
                a.href = page.permalink;
                a.textContent = page.title;
                li.appendChild(a);

                // Add description if available
                if (page.description) {
                     var pDesc = document.createElement('p');
                     pDesc.textContent = page.description;
                     pDesc.className = 'search-result-description'; // Add a class (optional)
                     li.appendChild(pDesc);
                }
            }
            ul.appendChild(li);
        });
        searchResults.appendChild(ul);
    }

    // Event listener for the search input
    if (searchQuery) {
        initLunr(); // Initialize Lunr.js when the page loads

        // Listen for keyboard input in the search box
        searchQuery.addEventListener('keyup', function(e) {
            search(this.value);
        });
    }
})();