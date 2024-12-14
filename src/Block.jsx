import React, { useState } from 'react';
import Draggable from 'react-draggable';

const Block = () => {
  const [blocks, setBlocks] = useState([{ id: 0, x: 200, y: 200 }]);
  const [connections, setConnections] = useState([]);
  const [endPoint, setEndPoint] = useState(null); // Track the end point

  // Add a new block
  const addBlock = () => {
    const randomX = Math.random() * window.innerWidth * 0.8;
    const randomY = Math.random() * window.innerHeight * 0.8;
    const newBlock = {
      id: blocks.length,
      x: randomX,
      y: randomY
    };
    setBlocks(prevBlocks => [...prevBlocks, newBlock]);
  };

  // Update block position
  const updateBlockPosition = (id, x, y) => {
    setBlocks(prevBlocks => prevBlocks.map(block => (block.id === id ? { ...block, x, y } : block)));
  };

  // Add a connection between two blocks
  const connectBlocks = (fromId, toId) => {
    if (fromId !== toId && !connections.find(c => c.from === fromId && c.to === toId)) {
      setConnections(prevConnections => [...prevConnections, { from: fromId, to: toId }]);
    }
  };

  // Remove a specific connection
  const removeConnection = (fromId, toId) => {
    setConnections(prevConnections => prevConnections.filter(c => c.from !== fromId || c.to !== toId));
  };

  // Save diagram to a JSON file
  const saveDiagram = () => {
    const data = JSON.stringify({ blocks, connections, endPoint });
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'diagram.json';
    link.click();
  };

  // Load diagram from a JSON file
  const loadDiagram = event => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = e => {
        const { blocks: loadedBlocks, connections: loadedConnections, endPoint: loadedEndPoint } = JSON.parse(e.target.result);
        setBlocks(loadedBlocks);
        setConnections(loadedConnections);
        setEndPoint(loadedEndPoint);
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="relative w-screen h-screen bg-slate-50 overflow-hidden">
      {/* SVG for connecting lines */}
      <svg className="absolute w-full h-full">
        {connections.map((connection, index) => {
          const fromBlock = blocks.find(b => b.id === connection.from);
          const toBlock = blocks.find(b => b.id === connection.to);
          if (!fromBlock || !toBlock) return null;

          // Generate a curved path
          const path = `M ${fromBlock.x + 50} ${fromBlock.y + 50} 
                  C ${fromBlock.x + 100} ${fromBlock.y + 50}, 
                    ${toBlock.x - 50} ${toBlock.y + 50}, 
                    ${toBlock.x + 50} ${toBlock.y + 50}`;

          return (
            <g key={index}>
              {/* Connection Path */}
              <path d={path} stroke="black" fill="transparent" strokeWidth="2" />

              {/* Remove Button */}
              <text
                x={(fromBlock.x + toBlock.x) / 2}
                y={(fromBlock.y + toBlock.y) / 2 - 10} // Offset the text slightly above the line
                fill="red"
                fontSize="16"
                fontWeight="bold"
                cursor="pointer"
                style={{ pointerEvents: 'all' }} // Enable pointer events for this element
                onClick={() => removeConnection(connection.from, connection.to)}
              >
                ✖
              </text>
            </g>
          );
        })}
      </svg>

      {/* Render blocks */}
      {blocks.map(block => (
        <Draggable key={block.id} position={{ x: block.x, y: block.y }} onStop={(e, data) => updateBlockPosition(block.id, data.x, data.y)}>
          <div className={`absolute p-4 flex flex-col items-center justify-center rounded shadow-md cursor-pointer ${endPoint === block.id ? 'bg-[#FF2929] border-4 ' : 'bg-slate-500'} text-white`}>
            <div>{block.id}</div>
            <button
              className="mt-2 bg-[#80C4E9] p-1 rounded"
              onClick={e => {
                e.stopPropagation();
                addBlock();
              }}
            >
              Add Block
            </button>
            <button
              className="mt-2 bg-[#118B50] p-1 rounded"
              onClick={e => {
                e.stopPropagation();
                const toId = prompt('Enter the ID of the block to connect to:');
                if (toId !== null && !isNaN(toId)) connectBlocks(block.id, parseInt(toId));
              }}
            >
              Connect
            </button>
            {endPoint !== block.id && (
              <button
                className="mt-2 bg-red-700 p-1 rounded"
                onClick={e => {
                  e.stopPropagation();
                  setEndPoint(block.id); // Set this block as the end point
                }}
              >
                Set as End Point
              </button>
            )}
            {/* <button
                className="mt-2 bg-red-700 p-1 rounded"
                onClick={e => {
                  e.stopPropagation();
                  setEndPoint(block.id); // Set this block as the end point
                }}
              >
                Set as End Point
              </button> */}
          </div>
        </Draggable>
      ))}

      {/* Save and Load buttons */}
      <div className="absolute top-4 left-4 flex space-x-2">
        <button className="bg-green-500 text-white p-2 rounded" onClick={saveDiagram}>
          Save Diagram
        </button>
        <input type="file" accept="application/json" className="bg-white text-black p-2 rounded cursor-pointer" onChange={loadDiagram} />
      </div>
    </div>
  );
};

export default Block;
