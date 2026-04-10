<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
    <title>Psycho E-Sports</title>

    <!-- Google Fonts -->
    <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700;900&family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <!-- FontAwesome -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    
    <!-- Cashfree Checkpoint JS SDK -->
    <script src="https://sdk.cashfree.com/js/v3/cashfree.js"></script>

    <style>
        :root {
            --bg-main: #eef1f5;
            --header-bg: #1c2135;
            --nav-bg: #000000;
            --text-light: #ffffff;
            --text-dark: #222222;
            --primary: #58c7a6; 
            --orange: #ff7626; 
            --safe-bottom: env(safe-area-inset-bottom, 20px);
        }

        * { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Roboto', sans-serif; -webkit-tap-highlight-color: transparent; }
        body { background-color: var(--bg-main); color: var(--text-dark); overflow-x: hidden; }
        .hidden { display: none !important; }

        /* Auth Screen */
        #auth-view { height: 100vh; display: flex; flex-direction: column; justify-content: center; align-items: center; background: var(--header-bg); color: #fff; padding: 20px; }
        #auth-view h1 { font-family: 'Poppins', sans-serif; margin-bottom: 30px; font-size: 2rem; display: flex; align-items: center; gap: 10px; }
        .auth-box { width: 100%; max-width: 400px; background: rgba(255,255,255,0.05); padding: 25px; border-radius: 15px; border: 1px solid rgba(255,255,255,0.1); }
        .input-group { margin-bottom: 15px; }
        .input-group label { display: block; font-size: 0.85rem; margin-bottom: 5px; color: #ccc; }
        .input-group input { width: 100%; padding: 12px; border-radius: 8px; border: none; background: #fff; color: #000; outline: none; }
        .btn-main { width: 100%; padding: 12px; border-radius: 8px; border: none; background: var(--primary); color: #fff; font-weight: bold; font-size: 1rem; cursor: pointer; margin-top: 10px; box-shadow: 0 4px 6px rgba(88,199,166,0.3);}
        .toggle-auth { text-align: center; margin-top: 15px; font-size: 0.85rem; color: #aaa; cursor: pointer; text-decoration: underline; }

        /* Main App Wrapper */
        #app { height: 100vh; display: flex; flex-direction: column; }

        /* Global Header */
        .top-header { background: var(--header-bg); padding: 15px 20px; display: flex; justify-content: space-between; align-items: center; color: white; padding-top: env(safe-area-inset-top, 15px); }
        .header-profile { display: flex; align-items: center; gap: 10px; }
        .header-profile img { width: 45px; height: 45px; border-radius: 50%; border: 2px solid #fff; }
        .header-text { text-align: center; flex: 1; }
        .header-text p { font-size: 0.8rem; color: #ccc; margin-bottom: 2px; }
        .header-text h3 { font-size: 1.1rem; font-weight: 500; font-family: 'Poppins', sans-serif; }
        .wallet-pill { background: #fff; color: #000; padding: 6px 12px; border-radius: 20px; font-weight: bold; font-size: 0.95rem; display: flex; align-items: center; gap: 5px; cursor: pointer;}
        .wallet-pill i { color: #4caf50; }

        /* Notification Ticker */
        .notif-banner { display: flex; align-items: stretch; background: #fff; font-weight: bold; font-size: 0.85rem; letter-spacing: 0.5px; box-shadow: 0 2px 5px rgba(0,0,0,0.05); }
        .notif-icon { background: var(--orange); color: white; padding: 15px 20px; font-size: 1.2rem; }
        .notif-text { padding: 15px 10px; overflow: hidden; white-space: nowrap; flex: 1; display: flex; align-items: center; color: #333; }
        .notif-text span { display: inline-block; animation: scrollLeft 15s linear infinite; }
        @keyframes scrollLeft { 0% { transform: translateX(100%); } 100% { transform: translateX(-100%); } }

        /* Content Area */
        .content { flex: 1; overflow-y: auto; padding-bottom: calc(80px + var(--safe-bottom)); }
        .view-section { display: none; animation: fadeIn 0.3s; }
        .view-section.active { display: block; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }

        /* Titles */
        .section-title { text-align: center; font-family: 'Poppins', sans-serif; font-weight: 600; font-size: 1.2rem; margin: 15px 0; color: #222; }
        .sec-header { background: var(--header-bg); padding: 15px; color: white; display: flex; align-items: center; gap: 15px; font-family: 'Poppins', sans-serif; padding-top: env(safe-area-inset-top, 15px); position: sticky; top: 0; z-index: 10; }
        .sec-header i { font-size: 1.2rem; cursor: pointer; }
        .sec-header h2 { font-size: 1.1rem; font-weight: 500; text-transform: uppercase; }

        /* Matches Banner & Links */
        .banner-container { width: 100%; height: 160px; background: url('https://i.ibb.co/LtbYd9r/FC-Banner.jpg') center/cover; margin-bottom: 10px; }
        .quick-links { display: flex; justify-content: space-evenly; padding: 0 10px; }
        .ql-card { background: #fff; width: 30%; aspect-ratio: 1; border-radius: 10px; display: flex; flex-direction: column; justify-content: center; align-items: center; gap: 10px; font-size: 0.9rem; font-weight: 500; box-shadow: 0 4px 6px rgba(0,0,0,0.05); cursor: pointer; }
        .ql-card i { font-size: 2rem; }

        /* Game Grids */
        .games-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; padding: 0 15px; }
        .game-card { background: var(--header-bg); border-radius: 8px; overflow: hidden; text-align: center; cursor: pointer; box-shadow: 0 4px 8px rgba(0,0,0,0.15); position: relative;}
        .game-card img { width: 100%; aspect-ratio: 1; object-fit: cover; border-bottom: 2px solid #ff1744; }
        .game-card .g-title { color: #fff; font-size: 0.7rem; font-weight: 700; padding: 8px 2px; text-transform: uppercase; }

        /* Match Items */
        .match-list-item { background: #fff; margin: 10px 15px; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.05); border:1px solid #eee; }
        .m-header { display: flex; justify-content: space-between; padding: 10px 15px; background: #f4f6f9; border-bottom: 1px solid #eaeaea; font-size: 0.85rem; font-weight: bold; }
        .m-body { display: flex; padding: 15px; gap: 15px; }
        .m-img { width: 80px; height: 80px; border-radius: 8px; object-fit: cover; border: 1px solid #ddd; }
        .m-info { flex: 1; }
        .m-title { font-size: 1rem; font-weight: 700; color: #222; margin-bottom: 5px; }
        .m-stats { display: flex; justify-content: space-between; font-size: 0.8rem; color: #666; margin-bottom: 4px; }
        .btn-m-action { background: var(--header-bg); color: #fff; border: none; padding: 8px 15px; border-radius: 5px; font-weight: bold; font-size: 0.8rem; margin-top: 10px; width: 100%; cursor: pointer;}

        .room-box { background: #e8f5e9; border: 1px solid #4caf50; padding: 10px; margin: 10px 15px; border-radius: 8px; text-align: center; color: #2e7d32;}

        /* Slots */
        .slot-header { background: var(--primary); color: white; text-align: center; padding: 12px; font-weight: bold; font-size: 1.1rem; }
        .slot-table-wrapper { padding: 15px; background: #fff; margin-top: 10px; }
        .slot-row { display: flex; flex-direction: column; margin-bottom: 12px; border-bottom: 1px solid #eee; padding-bottom: 8px; }
        .slot-row-top { display: flex; width: 100%; align-items: center; }
        .slot-team-name { width: 70px; font-weight: 600; font-size: 0.95rem; color: #333; }
        .slot-cols { display: flex; flex: 1; justify-content: space-around; }
        .slot-checkbox { display: flex; align-items: center; gap: 5px; font-weight: bold; font-size: 0.9rem; color: #555; }
        .slot-checkbox input { width: 18px; height: 18px; accent-color: var(--primary); cursor: pointer; }
        .slot-col-headers { display: flex; justify-content: space-around; margin-left: 70px; font-weight: bold; margin-bottom: 15px; color: #333; }
        
        .btn-join-team { background: var(--primary); color: #fff; border: none; padding: 10px 12px; border-radius: 6px; font-weight: bold; cursor: pointer; font-size: 0.85rem; width: 100%; margin-top: 10px; display: none; box-shadow: 0 2px 4px rgba(88,199,166,0.3); }
        .btn-join-team.active { display: block; animation: fadeIn 0.2s; }

        /* Gift Code UI */
        .gift-card { background: #fff; border-radius: 12px; margin: 15px; padding: 20px; text-align: center; box-shadow: 0 4px 10px rgba(0,0,0,0.05); border-top: 4px solid var(--orange); }
        .promo-list { display: flex; flex-direction: column; gap: 15px; padding: 15px; }
        .promo-banner { width: 100%; border-radius: 10px; object-fit: cover; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }

        /* Bottom Nav */
        .bottom-nav { position: fixed; bottom: 0; left: 0; width: 100%; background: var(--nav-bg); display: flex; justify-content: space-around; padding: 10px 0 calc(10px + var(--safe-bottom)); z-index: 100; border-top: 1px solid #222; }
        .nav-item { color: #888; font-size: 0.75rem; display: flex; flex-direction: column; align-items: center; gap: 5px; cursor: pointer; font-weight: 500; flex: 1; }
        .nav-item i { font-size: 1.3rem; }
        .nav-item.active { color: var(--primary); }
        .nav-item.active i { color: var(--primary); }

        /* Profile & Modals */
        .profile-card { background: #fff; margin: 15px; border-radius: 10px; padding: 20px; display: flex; align-items: center; gap: 15px; box-shadow: 0 2px 10px rgba(0,0,0,0.05); }
        .stat-box { flex: 1; text-align: center; border-right: 1px solid #eee; }
        .stat-box:last-child { border: none; }
        .action-list { margin: 15px; background: #fff; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 5px rgba(0,0,0,0.05); }
        .action-item { display: flex; justify-content: flex-start; align-items: center; gap:15px; padding: 15px 20px; border-bottom: 1px solid #eee; color: #333; text-decoration: none; font-weight: 500; cursor:pointer;}
        .action-item i.icon { width: 25px; text-align: center; color: var(--primary); font-size: 1.1rem; }

        .modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); z-index: 1000; display: flex; justify-content: center; align-items: center; opacity: 0; visibility: hidden; transition: 0.3s; padding: 20px; backdrop-filter: blur(4px);}
        .modal-overlay.active { opacity: 1; visibility: visible; }
        .modal-content { background: #fff; width: 100%; max-width: 400px; border-radius: 12px; padding: 20px; transform: scale(0.9); transition: 0.3s; max-height: 90vh; overflow-y: auto; }
        .modal-header { font-size: 1.2rem; font-weight: bold; margin-bottom: 15px; border-bottom: 1px solid #eee; padding-bottom: 10px; display: flex; justify-content: space-between; align-items: center;}
        
        #toast { position: fixed; top: 20px; left: 50%; transform: translateX(-50%) translateY(-50px); background: #333; color: #fff; padding: 12px 25px; border-radius: 30px; z-index: 2000; font-size: 0.95rem; opacity: 0; transition: 0.3s; box-shadow: 0 4px 10px rgba(0,0,0,0.3); font-weight:600; display:flex; align-items:center; gap:10px; }
        #toast.show { transform: translateX(-50%) translateY(0); opacity: 1; }

        .cashfree-badge { border: 1px solid var(--orange); color: var(--orange); padding: 5px; font-size: 0.75rem; border-radius: 5px; margin-left: 10px; display:inline-flex; align-items:center;}
        .btn-cashfree { background: linear-gradient(90deg, #6C2CC4, #F42E3D); color: #fff; width: 100%; font-size:1.1rem; border: none; padding: 15px; font-weight: bold; border-radius: 8px; cursor: pointer; box-shadow: 0 4px 8px rgba(0,0,0,0.15); margin-top:10px; }
    </style>
</head>
<body>

    <div id="toast">Message</div>

    <!-- AUTHENTICATION -->
    <div id="auth-view">
        <h1><img src="https://ui-avatars.com/api/?name=Psycho+Esports&background=ff1744&color=fff&rounded=true" width="50"> Psycho E-Sports</h1>
