import React, { useState } from 'react';

const SeatSelection = ({ movie, onConfirm, onCancel, isOpen }) => {
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [seatCount, setSeatCount] = useState(1);

  // Generate seat layout (10 rows x 15 seats = 150 seats)
  const rows = 10;
  const seatsPerRow = 15;
  
  // Create seat data
  const generateSeats = () => {
    const seats = [];
    for (let row = 1; row <= rows; row++) {
      const rowSeats = [];
      for (let seat = 1; seat <= seatsPerRow; seat++) {
        const seatId = `${row}-${seat}`;
        const isOccupied = Math.random() < 0.3; // 30% chance of being occupied
        rowSeats.push({
          id: seatId,
          row,
          seat,
          occupied: isOccupied,
          selected: false
        });
      }
      seats.push(rowSeats);
    }
    return seats;
  };

  const [seats, setSeats] = useState(generateSeats());

  const handleSeatClick = (rowIndex, seatIndex) => {
    const seat = seats[rowIndex][seatIndex];
    
    if (seat.occupied) return; // Can't select occupied seats
    
    const newSeats = [...seats];
    const isSelected = newSeats[rowIndex][seatIndex].selected;
    
    // If clicking on a selected seat, deselect it
    if (isSelected) {
      newSeats[rowIndex][seatIndex].selected = false;
      setSelectedSeats(prev => prev.filter(s => s !== seat.id));
    } else {
      // Check if we can select more seats
      if (selectedSeats.length >= seatCount) {
        // Remove the first selected seat
        const firstSelected = selectedSeats[0];
        const [firstRow, firstSeat] = firstSelected.split('-').map(Number);
        newSeats[firstRow - 1][firstSeat - 1].selected = false;
        setSelectedSeats(prev => prev.slice(1));
      }
      
      // Select the new seat
      newSeats[rowIndex][seatIndex].selected = true;
      setSelectedSeats(prev => [...prev, seat.id]);
    }
    
    setSeats(newSeats);
  };

  const handleConfirm = () => {
    if (selectedSeats.length === seatCount) {
      onConfirm({
        movie_id: movie.movie_id,
        seats_selected: seatCount,
        selected_seats: selectedSeats
      });
    }
  };

  const handleSeatCountChange = (newCount) => {
    setSeatCount(newCount);
    // Adjust selected seats if needed
    if (selectedSeats.length > newCount) {
      const newSelectedSeats = selectedSeats.slice(0, newCount);
      setSelectedSeats(newSelectedSeats);
      
      // Update seat selection state
      const newSeats = seats.map(row => 
        row.map(seat => ({
          ...seat,
          selected: newSelectedSeats.includes(seat.id)
        }))
      );
      setSeats(newSeats);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="seat-selection-modal">
      <div className="seat-selection-content">
        <div className="seat-selection-header">
          <h2>Select Seats for {movie.title}</h2>
          <button className="close-btn" onClick={onCancel}>×</button>
        </div>
        
        <div className="seat-selection-body">
          <div className="seat-count-selector">
            <label>Number of Seats:</label>
            <select 
              value={seatCount} 
              onChange={(e) => handleSeatCountChange(Number(e.target.value))}
            >
              {[1,2,3,4,5,6,7,8].map(num => (
                <option key={num} value={num}>{num}</option>
              ))}
            </select>
          </div>

          <div className="screen-indicator">
            <div className="screen">SCREEN</div>
          </div>

          <div className="seat-layout">
            {seats.map((row, rowIndex) => (
              <div key={rowIndex} className="seat-row">
                <div className="row-number">{rowIndex + 1}</div>
                {row.map((seat, seatIndex) => (
                  <button
                    key={seatIndex}
                    className={`seat ${seat.occupied ? 'occupied' : ''} ${seat.selected ? 'selected' : ''}`}
                    onClick={() => handleSeatClick(rowIndex, seatIndex)}
                    disabled={seat.occupied}
                  >
                    {seat.seat}
                  </button>
                ))}
              </div>
            ))}
          </div>

          <div className="seat-legend">
            <div className="legend-item">
              <div className="seat available"></div>
              <span>Available</span>
            </div>
            <div className="legend-item">
              <div className="seat occupied"></div>
              <span>Occupied</span>
            </div>
            <div className="legend-item">
              <div className="seat selected"></div>
              <span>Selected</span>
            </div>
          </div>

          <div className="seat-selection-footer">
            <div className="selected-info">
              {selectedSeats.length > 0 && (
                <p>Selected Seats: {selectedSeats.join(', ')}</p>
              )}
              <p>Total Price: ₹{(movie.price * seatCount).toFixed(2)}</p>
            </div>
            <div className="action-buttons">
              <button className="btn btn-secondary" onClick={onCancel}>
                Cancel
              </button>
              <button 
                className="btn btn-primary" 
                onClick={handleConfirm}
                disabled={selectedSeats.length !== seatCount}
              >
                Add to Cart ({selectedSeats.length}/{seatCount})
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeatSelection;
