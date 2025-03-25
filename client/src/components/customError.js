export const extractErrorMessage = (data) => {
    // Use regex to extract text inside <pre> tags
    const regex = /<pre>(.*?)<\/pre>/s;
    const matches = regex.exec(data);

    if (matches && matches[1]) {
        return matches[1].trim(); // Trim whitespace to clean the message
    }

    return 'An unknown error occurred.';
};
