//   submenu list Script
document.addEventListener('DOMContentLoaded', function () {
    // Hide the submenu on page load
    document.getElementById('lineageUl').style.display = 'none';

    // Add click event listener to lineageLi
    document.getElementById('lineageLi').addEventListener('click', function () {
      document.getElementById('attributeUl').style.display = 'none';
      document.getElementById('variableUl').style.display = 'none';
      document.getElementById('dataSourceUl').style.display = 'none';
      document.getElementById('userUl').style.display = 'none';
      document.getElementById('modalUl').style.display = 'none';
      document.getElementById('generalUl').style.display = 'none';
      

      var submenu = document.getElementById('lineageUl');
      if (submenu.style.display === 'none' || submenu.style.display === '') {
        submenu.style.display = 'block';
      } else {
        submenu.style.display = 'none';
      }
    });
  });

  document.addEventListener('DOMContentLoaded', function () {
    // Hide the submenu on page load
    document.getElementById('attributeUl').style.display = 'none';

    // Add click event listener to lineageLi
    document.getElementById('attributeLi').addEventListener('click', function () {
      document.getElementById('lineageUl').style.display = 'none';
      document.getElementById('variableUl').style.display = 'none';
      document.getElementById('dataSourceUl').style.display = 'none';
      document.getElementById('userUl').style.display = 'none';
      document.getElementById('modalUl').style.display = 'none';
      document.getElementById('generalUl').style.display = 'none';

      var submenu = document.getElementById('attributeUl');
      if (submenu.style.display === 'none' || submenu.style.display === '') {
        submenu.style.display = 'block';
      } else {
        submenu.style.display = 'none';
      }
    });
  });


  document.addEventListener('DOMContentLoaded', function () {
    // Hide the submenu on page load
    document.getElementById('variableUl').style.display = 'none';

    // Add click event listener to lineageLi
    document.getElementById('variableLi').addEventListener('click', function () {
      document.getElementById('lineageUl').style.display = 'none';
      document.getElementById('attributeUl').style.display = 'none';
      document.getElementById('dataSourceUl').style.display = 'none';
      document.getElementById('userUl').style.display = 'none';
      document.getElementById('modalUl').style.display = 'none';
      document.getElementById('generalUl').style.display = 'none';

      var submenu = document.getElementById('variableUl');
      if (submenu.style.display === 'none' || submenu.style.display === '') {
        submenu.style.display = 'block';
      } else {
        submenu.style.display = 'none';
      }
    });
  });


  document.addEventListener('DOMContentLoaded', function () {
    // Hide the submenu on page load
    document.getElementById('dataSourceUl').style.display = 'none';

    // Add click event listener to lineageLi
    document.getElementById('dataSourceLi').addEventListener('click', function () {
      document.getElementById('lineageUl').style.display = 'none';
      document.getElementById('attributeUl').style.display = 'none';
      document.getElementById('userUl').style.display = 'none';
      document.getElementById('modalUl').style.display = 'none';
      document.getElementById('generalUl').style.display = 'none';
      document.getElementById('variableUl').style.display = 'none';



      var submenu = document.getElementById('dataSourceUl');
      if (submenu.style.display === 'none' || submenu.style.display === '') {
        submenu.style.display = 'block';
      } else {
        submenu.style.display = 'none';
      }
    });
  });


  document.addEventListener('DOMContentLoaded', function () {
    // Hide the submenu on page load
    document.getElementById('generalUl').style.display = 'none';

    // Add click event listener to lineageLi
    document.getElementById('generalLi').addEventListener('click', function () {
      document.getElementById('lineageUl').style.display = 'none';
      document.getElementById('attributeUl').style.display = 'none';
      document.getElementById('userUl').style.display = 'none';
      document.getElementById('modalUl').style.display = 'none';
      document.getElementById('dataSourceUl').style.display = 'none';
      document.getElementById('variableUl').style.display = 'none';

      var submenu = document.getElementById('generalUl');
      if (submenu.style.display === 'none' || submenu.style.display === '') {
        submenu.style.display = 'block';
      } else {
        submenu.style.display = 'none';
      }
    });
  });


  document.addEventListener('DOMContentLoaded', function () {
    // Hide the submenu on page load
    document.getElementById('modalUl').style.display = 'none';
   

    // Add click event listener to lineageLi
    document.getElementById('modalLi').addEventListener('click', function () {
      document.getElementById('userUl').style.display = 'none';
      document.getElementById('generalUl').style.display = 'none';
      document.getElementById('lineageUl').style.display = 'none';
      document.getElementById('attributeUl').style.display = 'none';
      document.getElementById('dataSourceUl').style.display = 'none';
      document.getElementById('variableUl').style.display = 'none';


      var submenu = document.getElementById('modalUl');
      if (submenu.style.display === 'none' || submenu.style.display === '') {
        submenu.style.display = 'block';

      } else {
        submenu.style.display = 'none';
      }
    });
  });


  document.addEventListener('DOMContentLoaded', function () {
    // Hide the submenu on page load
    document.getElementById('userUl').style.display = 'none';


    // Add click event listener to lineageLi
    document.getElementById('userLi').addEventListener('click', function () {
      document.getElementById('modalUl').style.display = 'none';
      document.getElementById('generalUl').style.display = 'none';
      document.getElementById('lineageUl').style.display = 'none';
      document.getElementById('attributeUl').style.display = 'none';
      document.getElementById('dataSourceUl').style.display = 'none';
      document.getElementById('variableUl').style.display = 'none';


      var submenu = document.getElementById('userUl');
      if (submenu.style.display === 'none' || submenu.style.display === '') {
        submenu.style.display = 'block';
      } else {
        submenu.style.display = 'none';
      }
    });
  });
