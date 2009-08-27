var production = false;
//alert(document.domain);
if(production)
    document.write('<iframe src="http://localhost:4567/" width="0" height="0" border="0" frameborder="0"></iframe>');
else
    document.write('<iframe src="http://localhost:4567/" width="600" height="800" border="0" frameborder="0"></iframe>');

