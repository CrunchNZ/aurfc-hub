import React from 'react';
import { Draggable, Droppable } from '@hello-pangea/dnd';

const Bench = ({ players }) => {
  return (
    <div className="w-64 bg-gray-100 rounded-lg p-4 shadow-md">
      <h3 className="text-lg font-bold mb-4 text-center">Bench</h3>
      <Droppable droppableId="bench">
        {(provided, snapshot) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className={`min-h-96 rounded-lg transition-colors ${snapshot.isDraggingOver ? 'bg-gray-200' : ''}`}
          >
            {players.map((player, index) => (
              <Draggable key={player.id} draggableId={player.id} index={index}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className={`p-2 mb-2 rounded-lg shadow-sm transition-colors ${snapshot.isDragging ? 'bg-primary text-white' : 'bg-white'}`}
                  >
                    <div className="font-medium">{player.firstName} {player.lastName}</div>
                    <div className="text-sm text-gray-600">{player.position1}</div>
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
};

export default Bench;
