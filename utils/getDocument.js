function getDocument(selectorName, type, index = null) {
  switch (type) {
    case 'id':
      return document.getElementById(selectorName);
    
    case 'class':
      if (index !== null) {
        const elements = document.querySelectorAll(selectorName);
        return elements[index] || null;
      }
      return document.querySelector(selectorName);
    
    case 'tag':
      if (index !== null) {
        const elements = document.getElementsByTagName(selectorName);
        return elements[index] || null;
      }
      return document.getElementsByTagName(selectorName);
    
    default:
      return null;
  }
}

export { getDocument };

