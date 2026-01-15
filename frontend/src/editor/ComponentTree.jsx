function ComponentTree({ components, selectedId, onSelect }) {
    function renderNode(component, level = 0) {
        const isSelected = component.id === selectedId;

        return (
            <div key={component.id}>
                <div
                    onClick={() => onSelect(components.id)}
                    style={{
                        padding: '4px 8px',
                        marginLeft: level * 12,
                        cursor: 'pointer',
                        backgroundColor: isSelected ? '#6200ee' : 'transparent',
                        color: isSelected ? '#fff' : '#000',
                        borderRadius: 4,
                        fontSize: 12,
                    }}
                >
                    {component.type} . {component.id.slice(-4)}
                </div>
                {component.type === "Container" && component.children?.map(child => renderNode(child, level + 1))}
            </div>
        );
    }

    return (
        <div style={{ fontFamily: "monospace" }}>
            {components.map(c => renderNode(c))}
        </div>
    );
}

export default ComponentTree;

