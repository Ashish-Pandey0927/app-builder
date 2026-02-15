import { useLocation } from "react-router-dom";
import PublishedRenderer from "../renderer/PublishedRenderer";

export default function MobilePreview() {
    const location = useLocation();

    const params = new URLSearchParams(location.search);
    const data = params.get("data");

    const scema = data ? JSON.parse(decodeURIComponent(data)) : null;

    const firstScreen = schema?.screens?.[0]?.id;

    if(!schema) return <p>No app found</p>;

    return(
        <div style={{
            width: "100vw",
            height: "100vh",
            background: "#000",
            display: "flex",
            justifyContent:"center",
            alignItems:"center",
        }}>
            <div style={{
                width: "100%",
                maxWidth: 420,
                height: "100%",
                background: "#fff",
                overflow: "hidden",
            }}>
                <PublishedRenderer 
                    schema={schema}
                    screenId={firstScreen}
                    onNavigate={() => {}}
                />
            </div>
        </div>
    );
}