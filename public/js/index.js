$(function() {
    console.log("Hi pal. Hope your day is going nicely. Or night. You've picked a wild adventure trying to set this up.")
    console.log(`           ████
             ██                    
             ████                  
               ██                  
               ▒▒▒▒▒▒              
             ▒▒▒▒▒▒▒▒▒▒            
           ▒▒▒▒▒▒▒▒▒▒▒▒            
           ▒▒▒▒▒▒▒▒▒▒▒▒▒▒          
           ▒▒▒▒▒▒▒▒▒▒▒▒▒▒          
           ▒▒▒▒▒▒▒▒▒▒▒▒▒▒          
           ▒▒▒▒▒▒▒▒▒▒▒▒▒▒          
           ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒        
           ▒▒▒▒▒▒▒▒  ▒▒▒▒▒▒▒▒      
         ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒    
         ▒▒▒▒▒▒▒▒▒▒▒▒  ▒▒▒▒▒▒▒▒▒▒  
       ▒▒▒▒▒▒▒▒▒▒▒▒  ▒▒▒▒  ▒▒▒▒▒▒  
       ▒▒▒▒▒▒▒▒  ▒▒▒▒▒▒      ▒▒▒▒▒▒
     ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒  ▒▒  ▒▒  ▒▒▒▒
     ▒▒▒▒▒▒▒▒▒▒▒▒  ▒▒▒▒  ▒▒  ▒▒▒▒▒▒
     ▒▒▒▒▒▒▒▒  ▒▒▒▒▒▒  ▒▒      ▒▒▒▒
     ▒▒▒▒▒▒▒▒▒▒▒▒▒▒  ▒▒▒▒▒▒  ▒▒▒▒▒▒
     ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒  ▒▒▒▒▒▒▒▒▒▒
       ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒  
         ▒▒▒▒▒▒▒▒▒▒████▒▒▒▒▒▒▒▒    
           ▒▒▒▒▒▒▒▒██▒▒▒▒▒▒ `)
    if (window.location.pathname === "/") { $('#navbar-home').addClass("active") }
    if (window.location.pathname === "/remove") { $('#navbar-remove').addClass("active") }
    if (window.location.pathname === "/removeuser") { $('#navbar-remove-user').addClass("active") }
    if (window.location.pathname === "/denylist") { $('#navbar-denylist').addClass("active") }

});