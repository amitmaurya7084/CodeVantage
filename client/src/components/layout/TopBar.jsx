import { useEffect, useState } from "react";
// import { Link } from "react-router-dom";
// import { Mail, Linkedin, Instagram, Youtube } from "lucide-react";
import { fetchContent } from "../../services/contentService";

function TopBar() {
  const [text, setText] = useState({
    topBarText: "Project-Based Learning • Real Skills • Recognized Certificates",
    supportEmail: "support@codevantage.in",
  });

  
  return (
    <div>
      
    </div>
  );
}

export default TopBar;
