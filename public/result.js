document.addEventListener('DOMContentLoaded', function () {
    fetch('/results')
        .then(response => response.json())
        .then(data => {
            const resultsContainer = document.getElementById('resultsContainer');
            data.forEach(result => {
                const div = document.createElement('div');
                div.innerHTML = `${result._id}: ${result.count} votes`;
                resultsContainer.appendChild(div);
            });
        });
});
