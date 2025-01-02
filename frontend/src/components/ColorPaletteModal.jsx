// /src/components/ColorPaletteModal.jsx

const ColorPaletteModal = (palette) => {
    return (
        <dialog className="modal">
            <div className="modal-box">
                <div className="modal-action">
                    <form method="dialog">
                        <button className="btn">Close</button>
                    </form>
                </div>
            </div>
        </dialog>
    );
};